# Implementation Plan: AWS Deployment Infrastructure

## Overview

Implement the complete AWS deployment infrastructure for AfroChinaTrade using AWS CDK (TypeScript). Tasks follow the deployment sequencing defined in the design: Foundation → Storage → Compute → Edge → Observability → Security Monitoring. The backend is Node.js/Express with MongoDB Atlas; the mobile app is React Native Expo.

## Tasks

- [ ] 1. Dockerize the Node.js backend
  - [ ] 1.1 Create `backend/Dockerfile` for production build
    - Use `node:20-alpine` as base image
    - Copy `package.json` and `package-lock.json`, run `npm ci --omit=dev` to install production-only dependencies
    - Copy compiled TypeScript output (`dist/`) — do NOT copy `src/` or `node_modules` from host
    - Set `NODE_ENV=production`, expose port `3000`, set `CMD ["node", "dist/index.js"]`
    - Add a non-root user (`appuser`) and switch to it before the CMD instruction
    - _Requirements: 1.1, 1.6, 1.7_

  - [ ] 1.2 Create `backend/.dockerignore`
    - Exclude `node_modules`, `src/`, `.env*`, `*.log`, `coverage/`, `.git`
    - _Requirements: 1.6_

  - [ ] 1.3 Verify the Docker image builds and the health check endpoint responds
    - Build image locally: `docker build -t afct-backend:local ./backend`
    - Run container and confirm `GET /api/health` returns `{ status: "ok" }`
    - _Requirements: 1.1, 1.8, 2.4_

  - [ ]* 1.4 Write unit tests for environment variable validation at startup
    - Test that `validateEnvironment()` throws when required vars are missing
    - Test that the app exits (or throws) when `JWT_SECRET` is too short or is a default value
    - _Requirements: 1.8, 3.1_

- [ ] 2. Bootstrap the AWS CDK project
  - [ ] 2.1 Create `infrastructure/` directory and initialise a CDK TypeScript app
    - Run `cdk init app --language typescript` inside `infrastructure/`
    - Add `aws-cdk-lib` and `constructs` as dependencies; pin exact versions
    - Configure `cdk.json` with the app entry point and feature flags for the latest CDK bootstrap
    - _Requirements: 1.1, 2.1, 6.1_

  - [ ] 2.2 Define shared configuration and environment constants
    - Create `infrastructure/lib/config.ts` exporting `PROJECT` (`afct`), `ENVIRONMENTS` (`dev`, `staging`, `prod`), CIDR blocks, region, and account ID placeholders
    - Define the resource-naming helper function: `resourceName(env, type, descriptor)`
    - _Requirements: 1.1, 10.1_

  - [ ] 2.3 Create the CDK stack entry point with environment-aware instantiation
    - Create `infrastructure/bin/app.ts` that reads `CDK_ENV` and instantiates the correct stack set
    - _Requirements: 2.1, 3.1_

- [ ] 3. Phase 1 — Foundation stack (KMS, IAM, VPC, Security Groups)
  - [ ] 3.1 Implement KMS customer-managed keys construct
    - Create `infrastructure/lib/stacks/foundation-stack.ts`
    - Define a KMS key for secrets encryption and a separate key for S3/backup encryption; enable key rotation
    - _Requirements: 7.5, 11.3_

  - [ ] 3.2 Implement IAM roles with least-privilege policies
    - Create the App Runner instance role (`afct-{env}-iam-apprunner`) with policies scoped to:
      - `ecr:GetDownloadUrlForLayer`, `ecr:BatchGetImage`, `ecr:GetAuthorizationToken`
      - `secretsmanager:GetSecretValue` for specific secret ARNs only
      - `s3:PutObject`, `s3:GetObject` for the assets bucket ARN only
      - `cloudwatch:PutMetricData`, `logs:CreateLogGroup`, `logs:PutLogEvents`
    - Create the ECR push role for CI/CD with `ecr:PutImage` and related permissions
    - Explicitly deny `iam:*`, `organizations:*`, and cross-account actions
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.8_

  - [ ] 3.3 Implement VPC with public, private, and DB subnet tiers
    - Create VPC `afct-{env}-vpc-main` with CIDR `10.0.0.0/16` across 3 AZs (us-east-1a/b/c)
    - Public subnets: `10.0.1.0/24`, `10.0.2.0/24`, `10.0.3.0/24`
    - Private subnets: `10.0.10.0/24`, `10.0.11.0/24`, `10.0.12.0/24`
    - DB subnets: `10.0.20.0/24`, `10.0.21.0/24`, `10.0.22.0/24`
    - Attach Internet Gateway to public subnets; NAT Gateways in AZ1 and AZ2
    - Enable VPC Flow Logs to S3 with encryption
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.9, 10.10_

  - [ ] 3.4 Implement VPC Endpoints for private AWS service access
    - Add Gateway endpoints for S3 and DynamoDB
    - Add Interface endpoints for Secrets Manager, ECR API, ECR DKR, and CloudWatch Logs
    - _Requirements: 10.2, 10.3_

  - [ ] 3.5 Implement Security Groups
    - `afct-{env}-sg-apprunner`: allow inbound 443 from WAF only; allow outbound 443 to AWS services and MongoDB Atlas CIDR
    - `afct-{env}-sg-db`: allow inbound 27017 from App Runner SG only; deny all other inbound
    - _Requirements: 10.5, 10.6, 10.7, 10.8_

  - [ ]* 3.6 Write unit tests for CDK Foundation stack
    - Use `aws-cdk-lib/assertions` to assert KMS key rotation is enabled
    - Assert IAM role trust policy only allows `tasks.apprunner.amazonaws.com`
    - Assert VPC has 9 subnets (3 public, 3 private, 3 DB) and 2 NAT Gateways
    - Assert Security Group ingress rules match design spec
    - _Requirements: 6.1, 6.8, 10.1, 10.5_

- [ ] 4. Phase 2 — Storage stack (S3, Secrets Manager)
  - [ ] 4.1 Implement S3 assets bucket construct
    - Create `infrastructure/lib/stacks/storage-stack.ts`
    - Create bucket `afct-{env}-s3-assets` with versioning enabled, server-side encryption using the KMS key from Phase 1, and all public access blocked
    - Add lifecycle rule: transition objects older than 90 days to Glacier
    - Enable S3 server access logging to a separate logging bucket
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.9, 11.10_

  - [ ] 4.2 Implement S3 bucket policy restricting access to App Runner role and CloudFront OAC
    - Deny `s3:*` to any principal not matching the App Runner IAM role or CloudFront OAC
    - _Requirements: 6.6, 11.4_

  - [ ] 4.3 Implement Secrets Manager secrets for application credentials
    - Create secret `afct-{env}-secret-db-credentials` storing `MONGODB_URI` with KMS encryption
    - Create secret `afct-{env}-secret-app-keys` storing `JWT_SECRET`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_CLOUD_NAME`
    - Attach resource-based policy restricting `secretsmanager:GetSecretValue` to the App Runner IAM role ARN only
    - _Requirements: 7.1, 7.4, 7.5, 7.7_

  - [ ]* 4.4 Write unit tests for CDK Storage stack
    - Assert S3 bucket has versioning enabled and public access blocked
    - Assert S3 lifecycle rule transitions to Glacier after 90 days
    - Assert Secrets Manager secrets use the KMS key and have a resource policy
    - _Requirements: 11.2, 11.3, 7.5, 7.7_

- [ ] 5. Phase 3 — Compute stack (ECR, App Runner)
  - [ ] 5.1 Implement ECR repository construct
    - Create `infrastructure/lib/stacks/compute-stack.ts`
    - Create repository `afct-{env}-ecr-backend` with image scanning on push enabled and `IMMUTABLE` image tag mutability
    - Add lifecycle policy: keep last 10 tagged images; expire untagged images after 1 day
    - _Requirements: 1.3, 1.4, 1.5_

  - [ ] 5.2 Implement App Runner service construct
    - Create App Runner service `afct-{env}-apprunner-api` sourcing from the ECR repository
    - Configure instance role (from Phase 1) and access role for ECR
    - Set auto-scaling: min 2 instances, max 10 instances; scale on concurrent requests
    - Configure health check: path `/api/health`, interval 10s, timeout 5s, healthy threshold 1, unhealthy threshold 3
    - Set request timeout to 30 seconds
    - Pass environment variables referencing Secrets Manager ARNs (not plaintext values)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.7, 2.8, 16.3_

  - [ ] 5.3 Implement Secrets Manager integration in the Node.js backend
    - Install `@aws-sdk/client-secrets-manager` in `backend/`
    - Create `backend/src/config/secretsManager.ts` that fetches secrets from AWS Secrets Manager at startup using the IAM role (no hardcoded credentials)
    - Implement in-memory caching with a 5-minute TTL to reduce API calls
    - Merge fetched secrets into `process.env` before `validateEnvironment()` runs
    - Update `backend/src/index.ts` to call `loadSecretsFromAWS()` before `validateEnvironment()` when `NODE_ENV === 'production'`
    - _Requirements: 7.3, 7.4, 7.9_

  - [ ]* 5.4 Write unit tests for Secrets Manager integration
    - Mock `@aws-sdk/client-secrets-manager` and assert secrets are fetched and cached
    - Assert that a second call within 5 minutes uses the cache (no SDK call)
    - Assert that a call after 5 minutes re-fetches from AWS
    - _Requirements: 7.3, 7.9_

  - [ ]* 5.5 Write unit tests for CDK Compute stack
    - Assert ECR repository has image scanning on push and IMMUTABLE tag mutability
    - Assert App Runner service has min 2 / max 10 instances
    - Assert App Runner health check path is `/api/health` with correct thresholds
    - _Requirements: 1.4, 2.2, 2.3, 2.4_

- [ ] 6. Checkpoint — Validate Foundation, Storage, and Compute stacks
  - Ensure all CDK unit tests pass (`npm test` in `infrastructure/`)
  - Ensure the Docker image builds successfully and the health check passes locally
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Phase 4 — Edge stack (CloudFront, WAF, ACM)
  - [ ] 7.1 Implement ACM certificate construct
    - Create `infrastructure/lib/stacks/edge-stack.ts`
    - Request an ACM certificate in `us-east-1` (required for CloudFront) for the API domain and CDN domain with DNS validation
    - _Requirements: 2.6, 13.1_

  - [ ] 7.2 Implement CloudFront distribution for S3 assets
    - Create distribution `afct-{env}-cloudfront-cdn` with Origin Access Control (OAC) pointing to the S3 assets bucket
    - Set default cache behaviour: cache TTL 30 days, HTTPS only, TLS 1.2 minimum, redirect HTTP to HTTPS
    - Enable CloudFront access logging to the S3 logging bucket
    - _Requirements: 11.5, 11.6, 11.8, 11.9, 13.1_

  - [ ] 7.3 Implement WAF Web ACL and associate with App Runner
    - Create WAF Web ACL `afct-{env}-waf-api` with:
      - AWS Managed Rules: `AWSManagedRulesCommonRuleSet`, `AWSManagedRulesSQLiRuleSet`, `AWSManagedRulesKnownBadInputsRuleSet`, `AWSManagedRulesAmazonIpReputationList`
      - Custom rate-based rule: block IPs exceeding 2000 requests per 5 minutes, return 429
    - Set default action to `ALLOW`; all matched rules use `BLOCK`
    - Enable WAF logging to CloudWatch Logs
    - Associate the Web ACL with the App Runner service ARN
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [ ]* 7.4 Write unit tests for CDK Edge stack
    - Assert CloudFront distribution uses HTTPS only and TLS 1.2 minimum
    - Assert WAF Web ACL includes the rate-based rule with threshold 2000
    - Assert WAF includes `AWSManagedRulesCommonRuleSet` and IP reputation list
    - _Requirements: 9.1, 9.3, 9.5, 11.8_

- [ ] 8. Phase 5 — Observability stack (CloudWatch, SNS, CloudTrail)
  - [ ] 8.1 Implement SNS alert topic and subscriptions
    - Create `infrastructure/lib/stacks/observability-stack.ts`
    - Create SNS topic `afct-{env}-sns-alerts` with email subscription placeholder (configurable via CDK context)
    - _Requirements: 8.2, 15.8_

  - [ ] 8.2 Implement CloudWatch log groups with retention
    - Create log group `/afct/{env}/apprunner/api` with 30-day retention
    - Create log group `/afct/{env}/waf` with 30-day retention
    - Create log group `/afct/{env}/vpc-flow-logs` with 30-day retention
    - _Requirements: 2.8, 15.7_

  - [ ] 8.3 Implement CloudWatch metric alarms
    - App Runner: alarm on `5XXError` rate > 1% over 5 minutes → SNS
    - App Runner: alarm on `Latency` p99 > 5000ms over 5 minutes → SNS
    - App Runner: alarm on `RequestCount` drop to 0 for 5 minutes (service down) → SNS
    - S3: alarm on `4xxErrors` > 100 per minute → SNS
    - _Requirements: 15.3, 15.4, 15.5, 15.6, 15.8_

  - [ ] 8.4 Implement CloudWatch dashboard
    - Create dashboard `afct-{env}-dashboard` with widgets for:
      - App Runner: request count, latency (p50/p99), error rate, active instances
      - S3: request count, bytes downloaded
      - WAF: allowed vs blocked requests
    - _Requirements: 15.9, 15.10_

  - [ ] 8.5 Implement CloudTrail trail
    - Create trail `afct-{env}-cloudtrail` logging management and data events to the S3 logging bucket with KMS encryption
    - Enable log file validation
    - _Requirements: 6.7, 7.6, 14.1_

  - [ ]* 8.6 Write unit tests for CDK Observability stack
    - Assert CloudWatch log groups have 30-day retention
    - Assert SNS topic exists and alarms reference it
    - Assert CloudTrail has log file validation enabled
    - _Requirements: 2.8, 15.7, 15.8_

- [ ] 9. Phase 6 — Security Monitoring stack (GuardDuty, AWS Config)
  - [ ] 9.1 Implement GuardDuty enablement construct
    - Create `infrastructure/lib/stacks/security-stack.ts`
    - Enable GuardDuty detector with S3 protection and findings export to the S3 logging bucket
    - Create EventBridge rule: route GuardDuty findings with severity ≥ 7 (HIGH/CRITICAL) to the SNS alerts topic
    - _Requirements: 8.1, 8.2, 8.3, 8.7_

  - [ ] 9.2 Implement AWS Config recorder and managed rules
    - Enable AWS Config recorder for all resource types
    - Add managed rules: `restricted-ssh`, `s3-bucket-public-read-prohibited`, `s3-bucket-server-side-encryption-enabled`, `iam-password-policy`, `cloudtrail-enabled`
    - _Requirements: 14.1, 14.2, 14.3_

  - [ ]* 9.3 Write unit tests for CDK Security stack
    - Assert GuardDuty detector has S3 protection enabled
    - Assert EventBridge rule targets the SNS topic for HIGH/CRITICAL findings
    - Assert AWS Config recorder is enabled for all resource types
    - _Requirements: 8.1, 8.2, 14.1_

- [ ] 10. Configure EAS Build for the React Native Expo app
  - [ ] 10.1 Create `eas.json` with build profiles for development, staging, and production
    - `development`: `developmentClient: true`, internal distribution
    - `staging`: `distribution: "internal"`, points to staging App Runner URL
    - `production`: `distribution: "store"`, points to production App Runner URL, auto-submit enabled
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [ ] 10.2 Update `app.json` with versioning and environment-aware API configuration
    - Add `version`, `ios.buildNumber`, and `android.versionCode` fields
    - Add `extra.apiBaseUrl` driven by the `APP_ENV` environment variable (defaults to `development`)
    - _Requirements: 3.1, 3.2, 3.7_

  - [ ] 10.3 Create environment configuration module in the Expo app
    - Create `src/config/env.ts` (or equivalent path) that reads `Constants.expoConfig.extra.apiBaseUrl`
    - Export typed config object used by all API service files
    - _Requirements: 3.1, 3.2, 3.8, 3.9_

- [ ] 11. Environment variable and secrets wiring
  - [ ] 11.1 Create `backend/.env.production.template` documenting all required variables
    - List every variable from `validateEnv.ts` with placeholder values and a comment indicating which ones are sourced from Secrets Manager at runtime
    - Variables sourced from Secrets Manager: `MONGODB_URI`, `JWT_SECRET`, `CLOUDINARY_*`
    - Variables set as App Runner environment variables (non-secret): `NODE_ENV`, `PORT`, `AWS_REGION`
    - _Requirements: 1.8, 7.3_

  - [ ] 11.2 Update App Runner CDK construct to inject non-secret environment variables
    - Set `NODE_ENV=production`, `PORT=3000`, `AWS_REGION`, and `SECRETS_MANAGER_SECRET_ARN` as plain environment variables on the App Runner service
    - Do NOT pass `MONGODB_URI`, `JWT_SECRET`, or Cloudinary keys as plaintext App Runner env vars
    - _Requirements: 1.8, 7.3, 7.4_

- [ ] 12. CI/CD pipeline script for ECR image push
  - [ ] 12.1 Create `scripts/deploy-backend.sh` for building and pushing the Docker image to ECR
    - Authenticate Docker to ECR using `aws ecr get-login-password`
    - Build the image with tag `{ECR_URI}:v{VERSION}` and `{ECR_URI}:latest`
    - Push both tags to ECR
    - Trigger App Runner deployment via `aws apprunner start-deployment`
    - _Requirements: 1.2, 1.3, 2.9_

  - [ ] 12.2 Create `scripts/invalidate-cdn.sh` for CloudFront cache invalidation
    - Accept a path pattern argument (default `/*`)
    - Call `aws cloudfront create-invalidation` with the distribution ID from CDK outputs
    - _Requirements: 11.7_

- [ ] 13. Integration tests for the deployed architecture
  - [ ]* 13.1 Write integration test: health check endpoint reachability
    - HTTP GET to `{APP_RUNNER_URL}/api/health` and assert `status === "ok"` and HTTP 200
    - _Requirements: 2.4, 5.1_

  - [ ]* 13.2 Write integration test: Secrets Manager secret retrieval
    - In a test environment, call `loadSecretsFromAWS()` and assert all required env vars are populated
    - Assert a second call within 5 minutes does not invoke the AWS SDK (cache hit)
    - _Requirements: 7.3, 7.9_

  - [ ]* 13.3 Write integration test: S3 upload and CloudFront delivery
    - Upload a test asset to the S3 bucket using the App Runner IAM role credentials
    - Request the asset via the CloudFront URL and assert HTTP 200 with correct content
    - _Requirements: 11.1, 11.5, 6.5_

  - [ ]* 13.4 Write integration test: WAF rate limiting
    - Send 2001 requests in a 5-minute window to the App Runner URL and assert the 2001st returns HTTP 429
    - _Requirements: 9.3, 9.4_

  - [ ]* 13.5 Write integration test: IAM permission boundary enforcement
    - Attempt an action outside the App Runner role's policy (e.g., `iam:ListRoles`) and assert it is denied with `AccessDeniedException`
    - _Requirements: 6.2, 6.7_

- [ ] 14. Final checkpoint — Full stack validation
  - Run all CDK unit tests: `npm test` in `infrastructure/`
  - Run all backend unit tests: `npm test` in `backend/`
  - Synthesise the CDK app and confirm no synthesis errors: `cdk synth`
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP deployment
- Deployment order must follow the phase sequence: Foundation → Storage → Compute → Edge → Observability → Security Monitoring
- The design uses MongoDB Atlas (not RDS); Requirement 4 (RDS) is satisfied by MongoDB Atlas with equivalent controls
- All CDK stacks should be deployed with `cdk deploy --all` after synthesis passes
- Secrets Manager integration in the backend (`5.3`) is a prerequisite for any production deployment
- EAS Build tasks (`10.x`) are independent of the AWS CDK tasks and can be done in parallel
