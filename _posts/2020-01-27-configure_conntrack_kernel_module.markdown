---
layout: post
title:  "Configure the nf_conntrack kernel module"
date:   2020-01-27 16:00:00 +0300
categories: administration
---
## Check the module

For the beginning we must check that the module is installed and may be loaded:
```
# modinfo nf_conntrack
filename:       /lib/modules/3.10.0-862.14.4.el7.x86_64/kernel/net/netfilter/nf_conntrack.ko.xz
license:        GPL
retpoline:      Y
rhelversion:    7.5
srcversion:     BBD3DBF5304E6C31B2C2F14
depends:        libcrc32c
intree:         Y
vermagic:       3.10.0-862.14.4.el7.x86_64 SMP mod_unload modversions 
signer:         CentOS Linux kernel signing key
sig_key:        E4:A1:B6:8F:46:8A:CA:5C:22:84:50:53:18:FD:9D:AD:72:4B:13:03
sig_hashalgo:   sha256
parm:           tstamp:Enable connection tracking flow timestamping. (bool)
parm:           acct:Enable connection tracking flow accounting. (bool)
parm:           nf_conntrack_helper:Enable automatic conntrack helper assignment (default 1) (bool)
parm:           expect_hashsize:uint
```
Output like this says us that all is OK and we may try to load the module. We
can do it manually just for testing purposes:
```
# modprobe nf_conntrack
```
The command will return nothing if there were no problems in module loading. So
just check that the module is loaded now:
```
# lsmod | grep nf_conntrack
nf_conntrack_ipv6      18935  11 
nf_defrag_ipv6         35104  1 nf_conntrack_ipv6
nf_conntrack_ipv4      15053  12 
nf_defrag_ipv4         12729  1 nf_conntrack_ipv4
nf_conntrack          133053  7 nf_nat,nf_nat_ipv4,nf_nat_ipv6,xt_conntrack,nf_nat_masquerade_ipv4,nf_conntrack_ipv4,nf_conntrack_ipv6
libcrc32c              12644  2 nf_nat,nf_conntrack
```
Such output means that all is fine.

## Persistent module loading

The module may be loaded automatically at boot time which is very useful in the
most of cases and there are some ways to do it.

The simplest way to load the module is creating a simple test file under the
`/etc/modules-load.d/` directory:
```
# cat /etc/modules-load.d/nf_conntrack.conf
nf_conntrack
```
If we need some sort of configuration of the module at the same time we must
create yet another test file:
```
# cat /etc/modprobe.d/nf_conntrack.conf
options nf_conntrack hashsize=8192
```
See the `modules-load.d(5)` and `systemd-modules-load.service(8)` man pages
for details.

The second way to load the module at boot time requires only one additional
file which is a little bit more convenient to support: 
```
# cat /etc/sysconfig/modules/nf_conntrack.modules
#!/bin/sh
exec /sbin/modprobe nf_conntrack hashsize=8192 >/dev/null 2>&1
```
The ` >/dev/null 2>&1` part of the command redirects any output to `/dev/null`
so the `modprobe` command remains quiet.

After rebooting a node we should find out that the module is loaded (see the
`lsmod` command above) and has the correct configuration:
```
# sysctl net.netfilter.nf_conntrack_buckets
net.netfilter.nf_conntrack_buckets = 8192
```
or
```
cat /proc/sys/net/netfilter/nf_conntrack_buckets
8192
```

## Change module parameters at the runtime

Sometimes it is necessary to apply new module parameters values at the runtime
for testing purposes or something. It is possible to do by changing the values
in the files above with subsequent reloading of the module. But usually it is
hard to unload and then load the module again because of module dependencies.

So in this case we can use a special file(s):
```
# echo 16384 > /sys/module/nf_conntrack/parameters/hashsize
```
And after this command we may check the current values of the parameters again
to be sure that the new values were applied:
```
# sysctl net.netfilter.nf_conntrack_buckets
net.netfilter.nf_conntrack_buckets = 16384
# cat /proc/sys/net/netfilter/nf_conntrack_buckets
16384
# cat /sys/module/nf_conntrack/parameters/hashsize
16384
```

But don't forget that after rebooting the node this new value will be lost.

## Sources
* [WORKING WITH KERNEL MODULES](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/kernel_administration_guide/chap-documentation-kernel_administration_guide-working_with_kernel_modules)
* [PERSISTENT MODULE LOADING](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/6/html/deployment_guide/sec-persistent_module_loading) - for RH/CentOS 6
* [PERSISTENT MODULE LOADING](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/7/html/Kernel_Administration_Guide/sec-Persistent_Module_Loading.html) - for RH/CentOS 7
