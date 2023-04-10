---
layout: post
title:  "Repair YUM database"
date:   2019-12-15 12:15:03 +0300
categories: administration
---
## YUM database

Sometimes YUM database may crash due to disk problems or incomplete execution
of the `yum` or `rpm` commands. In this case the message like this may be displayed:
```
error: rpmdb: BDB0113 Thread/process 34684/140628407769152 failed: BDB1507 Thread died in Berkeley DB library
error: db5 error(-30973) from dbenv->failchk: BDB0087 DB_RUNRECOVERY: Fatal error, run database recovery
error: cannot open Packages index using db5 -  (-30973)
error: cannot open Packages database in /var/lib/rpm
error: rpmdb: BDB0113 Thread/process 34684/140628407769152 failed: BDB1507 Thread died in Berkeley DB library
error: db5 error(-30973) from dbenv->failchk: BDB0087 DB_RUNRECOVERY: Fatal error, run database recovery
error: cannot open Packages database in /var/lib/rpm
```
To fix the problem the following sequence of command may be executed:
```bash
mv /var/lib/rpm/__db* /tmp/
rpm --rebuilddb
yum clean all
rpm -q kernel
```
Source: https://ma.ttias.be/yum-update-db_runrecovery-fatal-error-run-database-recovery/

## YUM history

YUM history may also crash due to some unknown things. In this case the
following message will be shown:
```
Traceback (most recent call last):
  File "/bin/yum", line 29, in <module>
    yummain.user_main(sys.argv[1:], exit_code=True)
  File "/usr/share/yum-cli/yummain.py", line 375, in user_main
    errcode = main(args)
  File "/usr/share/yum-cli/yummain.py", line 281, in main
    return_code = base.doTransaction()
  File "/usr/share/yum-cli/cli.py", line 817, in doTransaction
    resultobject = self.runTransaction(cb=cb)
  File "/usr/lib/python2.7/site-packages/yum/__init__.py", line 1852, in runTransaction
    self.skipped_packages, rpmdb_problems, cmdline)
  File "/usr/lib/python2.7/site-packages/yum/history.py", line 947, in beg
    pid   = self.pkg2pid(txmbr.po)
  File "/usr/lib/python2.7/site-packages/yum/history.py", line 804, in pkg2pid
    return self._ipkg2pid(po, create)
  File "/usr/lib/python2.7/site-packages/yum/history.py", line 798, in _ipkg2pid
    return self._pkgtup2pid(po.pkgtup, csum, create)
  File "/usr/lib/python2.7/site-packages/yum/history.py", line 759, in _pkgtup2pid
    epoch=? AND version=? AND release=?""", pkgtup)
  File "/usr/lib/python2.7/site-packages/yum/sqlutils.py", line 168, in executeSQLQmark
    return cursor.execute(query, params)
sqlite3.DatabaseError: database disk image is malformed
```
The following command may help here:
```bash
yum history new
```
Source: https://forums.fedoraforum.org/showthread.php?260195-Problem-with-yum-Error-database-disk-image-is-malformed