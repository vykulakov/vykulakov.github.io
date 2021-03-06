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

The simplest way to load the module is creating a simple config file under the
`/etc/modules-load.d/` directory:
```
# cat /etc/modules-load.d/nf_conntrack.conf
nf_conntrack
```
If we need some sort of configuration of the module at the same time we must
create yet another config file:
```
# cat /etc/modprobe.d/nf_conntrack.conf
options nf_conntrack hashsize=8192
```

This is a standard and recommended way to configure persistent module loading
in RH/CentOS 7. See links at the end of the page and the `modules-load.d(5)`
and `systemd-modules-load.service(8)` man pages for details.

The second way to load the module at boot time requires only one additional
config file which is a little bit more convenient to support: 
```
# cat /etc/sysconfig/modules/nf_conntrack.modules
#!/bin/sh
exec /sbin/modprobe nf_conntrack hashsize=8192 >/dev/null 2>&1
```
The `>/dev/null 2>&1` part of the command redirects any output to `/dev/null`
so the `modprobe` command remains quiet.

This is a standard and recommended way to configure persistent module loading
in RH/CentOS 6. See links at the end of the page for details.

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

To configure the module without its reloading or restarting the whole system
there are some ways as well and a particular way depends on a Linux kernel
version. For old kernels like `3.10.x` we should use special files like this:
```
# echo 16384 > /sys/module/nf_conntrack/parameters/hashsize
```

For newer kernels like `4.x` or `5.x` we should use `sysctl`:
```
# sysctl -w net.netfilter.nf_conntrack_buckets=16384
16384
```

Additionally, we may store that `sysctl` parameter in a config file and then
just reload the whole `sysctl` configuration:
```
# cat /etc/sysctl.d/00-test.conf
net.netfilter.nf_conntrack_buckets=16384
# sysctl -p
```

After executing those commands it is worth to check the current values of
the parameters just to be sure that the new values were applied:
```
# sysctl net.netfilter.nf_conntrack_buckets
net.netfilter.nf_conntrack_buckets = 16384
# cat /proc/sys/net/netfilter/nf_conntrack_buckets
16384
# cat /sys/module/nf_conntrack/parameters/hashsize
16384
```
All these places should contain the same value!

And finally, don't forget that after rebooting the node this new values will be
lost (except those configured via the `/etc/sysctl.d/*.conf` files).

## Load the module with iptables

If iptables is already used on nodes as a firewall then it may be used to load
the module and configure it automatically at loading or even reloading of
iptables.

To enable this feature it is necessary to change iptables configuration:
```
# cat /etc/sysconfig/iptables-config
# Load additional iptables modules (nat helpers)
#   Default: -none-
# Space separated list of nat helpers (e.g. 'ip_nat_ftp ip_nat_irc'), which
# are loaded after the firewall rules are applied. Options for the helpers are
# stored in /etc/modprobe.conf.
IPTABLES_MODULES="nf_conntrack"

# Reload sysctl settings on start and restart
#   Default: -none-
# Space separated list of sysctl items which are to be reloaded on start.
# List items will be matched by fgrep.
IPTABLES_SYSCTL_LOAD_LIST=".nf_conntrack .bridge-nf"
```
Both parameters should be uncomment and should have correct values like in
the example. Please note, that the module should be already configured via
the `/etc/sysctl.conf` or `/etc/sysctl.d/*.conf` files before.

And don't forget that this will work only on the new kernels.

## Sources
* [WORKING WITH KERNEL MODULES](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/kernel_administration_guide/chap-documentation-kernel_administration_guide-working_with_kernel_modules)
* [PERSISTENT MODULE LOADING](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/6/html/deployment_guide/sec-persistent_module_loading) - for RH/CentOS 6
* [PERSISTENT MODULE LOADING](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/7/html/Kernel_Administration_Guide/sec-Persistent_Module_Loading.html) - for RH/CentOS 7
