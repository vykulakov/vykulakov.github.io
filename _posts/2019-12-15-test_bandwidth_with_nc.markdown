---
layout: post
title:  "Test bandwidth with nc"
date:   2019-12-15 14:00:03 +0300
categories: administration
---
## Start server

Because `nc` accepts only one connection at the time and exits right after
the connection is closed it will be very useful to start `nc` server in a
loop to execute multiple tests:
```bash
while true; do nc -v -l 12345 > /dev/null; done;                                                                                                                    
Ncat: Version 7.50 ( https://nmap.org/ncat )
Ncat: Listening on :::12345
Ncat: Listening on 0.0.0.0:12345
```

Just don't forget to open the port in firewall on the server (iptables in this
case):
```bash
# Show rules in the INPUT chain with their number
iptables -n -L INPUT --line-numbers
# Insert the new rule before the last drop-all rule
iptables -I INPUT 25 -m tcp -p tcp --dport 12345 -j ACCEPT
# Check new rule set
iptables -n -L INPUT --line-numbers
```

## Start client

Now it is a turn to start a test client:
```
dd if=/dev/zero bs=1024K count=4 | nc -v 1.1.1.1 12345                                                                                                      
Ncat: Version 6.40 ( http://nmap.org/ncat )
Ncat: Connected to 1.1.1.1:12345.
16+0 records in
16+0 records out
16777216 bytes (17 MB) copied, 401.152 s, 41.8 kB/s
Ncat: 16777216 bytes sent, 0 bytes received in 404.67 seconds.
```
It will be useful to start with a low number of packets like 4 and then slowly
increase it to avoid long execution time.
