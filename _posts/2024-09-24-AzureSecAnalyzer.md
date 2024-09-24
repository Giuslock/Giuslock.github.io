---
layout: post
title: "AzureSecAnalyzer - A PowerShell project that checks the security settings of Azure resources."
date: 2024-09-24 15:24:01 +0200
categories: projects
---

I'm excited to announce that I've just published **AzureSecAnalyzer**, a PowerShell-based tool that checks the security settings of Azure resources. Whether you're managing a small-scale deployment or a multi-tenant environment, AzureSecAnalyzer provides comprehensive insights into the security configurations of your Azure resources and helps you identify potential vulnerabilities.

### What Is AzureSecAnalyzer?
AzureSecAnalyzer is a versatile PowerShell project designed to analyze the security settings of various Azure resources, giving you a clear overview of how secure your environment is. The tool currently supports a wide range of Azure services, including:

- Analysis Services
- App Services
- Azure Cache for Redis
- Cosmos DB
- Disks
- Event Hub Namespaces
- Key Vaults
- PostgreSQL (Flexible and Single Servers)
- SQL Database and SQL Server
- Storage Accounts

AzureSecAnalyzer outputs the analysis results in an easy-to-read `.xlsx` file, making it simple to sort, filter, and interpret the data to improve your security posture.

### How It Works
Once everything is set up, running AzureSecAnalyzer is straightforward. The tool offers different modes based on your needs:

- **Subscription mode:** Analyze the entire Azure subscription.
- **Resource Group mode:** Focus on specific resource groups.
- **Tenant mode:** Analyze at the tenant level without additional input.

The process is simple:
1. Run the script `launch.ps1`.
2. Input the required details (subscription, resource group, etc.) into the `variables.txt` file.
3. The script will perform the analysis and generate a comprehensive `.xlsx` report.

### Output Format
The results are saved as an .xlsx file for easy analysis. You can quickly identify weak security settings and take the necessary actions to secure your environment.