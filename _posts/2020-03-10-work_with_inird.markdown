---
layout: post
title:  "Work with inird and iniramfs images"
date:   2020-03-10 16:30:00 +0300
categories: administration
---
## Introduction

The Linux initrd mechanism (short for “initial RAM disk”) refers to a small
file system archive that is unpacked by the kernel and contains the first
userspace code that runs. It typically finds and transitions into the actual
root file system to use. systemd supports both initrd and initrd-less boots.
If an initrd is used it is a good idea to pass a few bits of runtime
information from the initrd to systemd in order to avoid duplicate work and to
provide performance data to the administrator.

## Working with initrd images

All available initrd (or initramfs) images may be found in the `/boot` folder:
```
# ll /boot/init*
-rw-------. 1 root root 18892043 Feb 26 04:56 /boot/initramfs-3.10.0-1062.12.1.el7.x86_64.img
-rw-------. 1 root root 18889284 Feb 26 04:56 /boot/initramfs-3.10.0-1062.el7.x86_64.img
-rw-------  1 root root 19146120 Mar  5 09:41 /boot/initramfs-5.5.4-1.el7.elrepo.x86_64.img
```
Here there are some images for each installed version of Linux kernel. So if
your kernel version is `3.10.0-1062.el7.x86_64` (you may get it with the
`uname -r` command) then the `initramfs-3.10.0-1062.el7.x86_64.img` image will
be used on the next boot.

If you wish check the content of a particular image you can unpack it into a
folder:
```
# mkdir /tmp/initramfs
# cd /tmp/initramfs
# /usr/lib/dracut/skipcpio /boot/initramfs-$(uname -r).img | gunzip -c | cpio -id
74153 blocks
```
Instead of `uname -r` you can use any other installed kernel version.

After executing the command you will have the content of the image in the
`/tmp/initramfs` folder so you may explore it then.

Sometimes it is necessary to regenerate initramfs images to accept changes in
the root file system, for example. In that case you can use dracut - a tool and
infrastructure to create initramfs images from installed system. So just run
`dracut -f` to regenerate an image:
```
# dracut -f
# dracut -f /boot/initramfs-2.6.32-220.7.1.el6.x86_64.img 2.6.32-220.7.1.el6.x86_64
```

## Sources
* [Initrd](https://wiki.debian.org/Initrd)
* [Dracut](https://dracut.wiki.kernel.org/index.php/Main_Page)
* [The initrd Interface of systemd](https://systemd.io/INITRD_INTERFACE/)
* [systemd and Storage Daemons for the Root File System](https://systemd.io/ROOT_STORAGE_DAEMONS/)
