---
layout: post
title:  "Configure rsync server"
date:   2019-12-18 12:00:00 +0300
categories: administration
---
## Configure server

For the beginning we must configure a new rsync server:
```
# mkdir /rsync_data/
# cat /etc/rsyncd.conf
[rsync_data]
    path = /rsync_data/
    read only = no
    auth users = user1 user2
    secrets file = /etc/rsyncd.scrt
```
It will be great to enable authentication to the new server even when it is
supposed to be used only internally. So this config contains the `auth users`
and `secrets file` options to do it. The second one points to a file with
user passwords and we should create it and set correct rights:
```
# cat /etc/rsyncd.scrt
user1:password1
user2:password2
# chmod 600 /etc/rsyncd.scrt
```
Then we should configure a rsync daemon process:
```
# cat /etc/sysconfig/rsyncd
OPTIONS="--port=12345"
```
and restart the server to apply the new configurations
```
# systemctl restart rsyncd
```
Finally, a firewall should accept connection on the configured rsync port.
So check the current firewalls rules:
```
# iptables -L -n --line-numbers
```
and then add the following rule right before the first block-all rule (its
number is 7 in this example):
```
# iptables -I INPUT 7 -m tcp -p tcp --dport 12345 -j ACCEPT
```
If you are in the mood you may filter client by source addresses or save the
new rule set to a file.

Please note if you have enabled SELinux in your OS you should allow rsync
to use the new custom port and the custom directory.

## Test configured server

Now it is time to test our rsync server.

But before create a password file to do not pass a password in command line
arguments (that may be useful to build long running solution):
```
# cat /tmp/rsyncpass
password1
# chmod 600 /tmp/rsyncpass
```
Prepare some test data:
```
# mkdir /tmp/rsynctest/
# dd if=/dev/zero bs=1024K count=128 > /tmp/rsynctest/test1
# rsync -a --progress --remove-source-files --timeout=60 --password-file=/tmp/rsyncpass /tmp/rsynctest rsync://user1@1.2.3.4:12345/rsync_data
```
If all was configured correctly we should see a correct command output like this:
```
sending incremental file list
rsynctest/
rsynctest/test1
      2,097,152 100%    2.11MB/s    0:00:00 (xfr#1, to-chk=0/2)
```
