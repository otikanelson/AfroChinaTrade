# AWS Deployment Infrastructure Design

## Overview

AfroChinaTrade is a fintech/trade platform requiring a professional, secure, and scalable AWS architecture. This design document covers the complete AWS deployment infrastructure for the platform, which consists of:

- **Mobile Frontend**: React Native Expo application (iOS and Android) distributed via App Store and Google Play
- **Backend API**: Node.js/Express application with MongoDB, deployed on AWS App Runner
- **Static Assets**: S3 with CloudFront CDN for media files and product images
- **Security Infrastructure**: IAM, Secrets Manager, GuardDuty, WAF, VPC, and CloudWatch

> **Important Note on Database Technology**: The current backend uses MongoDB (via Mongoose ODM) rather than MySQL/PostgreSQL as stated in the requirements. This design addresses MongoDB Atlas as the primary database with Amazon DocumentDB as an AWS-native alternative. All RDS-specific requirements are mapped to equivalent MongoDB/DocumentDB capabilities.

### Design Principles

1. **Least Privilege**: Every service has only the permissions it needs
2. **Defense in Depth**: Multiple security layers (WAF -> App Runner -> VPC -> Security Groups -> DB)
3. **Infrastructure as Code**: All resources defined in AWS CDK (TypeScript) for reproducibility
4. **Observability First**: Structured logging, metrics, and alerting from day one
5. **Financial Data Integrity**: ACID-compliant transactions with full audit trails

### Resource Naming Convention

All AWS resources follow this naming pattern:

```
{project}-{environment}-{resource-type}-{descriptor}
```

Examples:
- `afct-prod-ecr-backend` - ECR repository for production backend
- `afct-prod-apprunner-api` - App Runner service
- `afct-prod-vpc-main` - Main VPC
- `afct-prod-sg-apprunner` - Security group for App Runner
- `afct-prod-secret-db-credentials` - Secrets Manager secret for DB
- `afct-prod-s3-assets` - S3 bucket for static assets
- `afct-prod-cloudfront-cdn` - CloudFront distribution

Environments: `dev`, `staging`, `prod`
## Architecture

### High-Level System Architecture

```mermaid
graph TB
    subgraph Mobile["Mobile Layer"]
        APP[React Native Expo App]
    end

    subgraph Edge["Edge / CDN Layer"]
        CF[CloudFront CDN]
        WAF[AWS WAF]
        ACM[ACM Certificate]
    end

    subgraph Compute["Compute Layer - AWS App Runner"]
        AR[App Runner Service]
        ECR[ECR Repository]
    end

    subgraph Data["Data Layer"]
        DB[(DocumentDB / MongoDB Atlas)]
        S3[S3 Assets Bucket]
    end

    subgraph Security["Security Layer"]
        SM[Secrets Manager]
        GD[GuardDuty]
        IAM[IAM Roles]
        KMS[KMS Keys]
    end

    subgraph Observability["Observability Layer"]
        CW[CloudWatch Logs/Metrics]
        SNS[SNS Alerts]
        CT[CloudTrail]
    end

    APP -->|HTTPS| WAF
    WAF --> AR
    APP -->|Assets| CF
    CF --> S3
    AR --> DB
    AR --> S3
    AR --> SM
    ECR --> AR
    AR --> CW
    GD --> SNS
    CW --> SNS
```

### VPC Network Architecture

```mermaid
graph TB
    subgraph VPC["VPC: afct-prod-vpc-main (10.0.0.0/16)"]
        subgraph AZ1["Availability Zone: us-east-1a"]
            PUB1[Public Subnet 10.0.1.0/24]
            PRIV1[Private Subnet 10.0.10.0/24]
            DBSUB1[DB Subnet 10.0.20.0/24]
        end
        subgraph AZ2["Availability Zone: us-east-1b"]
            PUB2[Public Subnet 10.0.2.0/24]
            PRIV2[Private Subnet 10.0.11.0/24]
            DBSUB2[DB Subnet 10.0.21.0/24]
        end
        subgraph AZ3["Availability Zone: us-east-1c"]
            PUB3[Public Subnet 10.0.3.0/24]
            PRIV3[Private Subnet 10.0.12.0/24]
            DBSUB3[DB Subnet 10.0.22.0/24]
        end
        IGW[Internet Gateway]
        NAT1[NAT Gateway AZ1]
        NAT2[NAT Gateway AZ2]
        VPE[VPC Endpoints: S3, Secrets Manager, ECR, CloudWatch]
    end
    PUB1 --> IGW
    PUB2 --> IGW
    PUB3 --> IGW
    PUB1 --> NAT1
    PUB2 --> NAT2
    PRIV1 --> NAT1
    PRIV2 --> NAT2
    PRIV3 --> NAT2
```

### Deployment Sequencing

Resources must be deployed in this order to satisfy dependencies:

1. **Foundation** (no dependencies): KMS keys, IAM roles, VPC, subnets, security groups
2. **Storage** (depends on KMS, VPC): S3 buckets, DocumentDB cluster, Secrets Manager secrets
3. **Compute** (depends on ECR, Secrets Manager, VPC): ECR repository, App Runner service
4. **Edge** (depends on S3, App Runner, ACM): CloudFront distribution, WAF web ACL
5. **Observability** (depends on all): CloudWatch dashboards, alarms, SNS topics
6. **Security Monitoring** (depends on all): GuardDuty, AWS Config, CloudTrail
