# Kubernetes PostgreSQL Infrastructure with CDK8s

## Project Overview
This project implements a PostgreSQL database infrastructure using CDK8s and the Zalando Postgres Operator on a Kubernetes cluster hosted on Hetzner. The solution provides a reusable framework for creating and managing PostgreSQL databases.

## Architecture Decisions

### Why Zalando Postgres Operator?
We chose the Zalando Postgres Operator over alternatives (Cloud Native Postgres, CrunchyData) for several key reasons:
- Production-proven reliability in self-hosted environments
- Native support for point-in-time recovery (PITR)
- Lightweight resource requirements suitable for VPS deployment
- Extensive high availability features
- Strong community support and documentation

## Setup Instructions

### Prerequisites
- Node.js installed
- Kubernetes cluster access configured
- `kubectl` CLI installed

### Project Setup

Install Zalando Postgres Operator CRDs:


### For Local k8s only ( Testing )
- install k3s [See the other README](./clusters/local/README.md)



### Install PostgreSQL CRD
```sh
kubectl apply -f https://raw.githubusercontent.com/zalando/postgres-operator/master/manifests/postgresql.crd.yaml
```

### Install Operator Configuration CRD

```sh
kubectl apply -f https://raw.githubusercontent.com/zalando/postgres-operator/master/manifests/operatorconfiguration.crd.yaml
```

### Synthesize and deploy:

```sh
npx cdk8s synth
```

### Apply the generated manifests
```ssh
kubectl apply -f dist/
```


# Advanced configurations

## Disaster Recovery Procedures

### Database Corruption Recovery
The Zalando Postgres Operator provides point-in-time recovery capabilities. When database corruption occurs from failed migrations or other issues, we can restore the affected database to a specific timestamp before the corruption event. This targeted recovery process maintains continuous access to other uncorrupted databases in the cluster.

### Single Node/Volume Failure Recovery
For single-node setups facing complete volume failure, we maintain business continuity through a streamlined recovery process. The Zalando operator manages this automatically through:

Regular full backups combined with continuous WAL (Write-Ahead Log) archiving to remote storage. When failure occurs, the operator provisions new storage and restores from the most recent backup while replaying WAL files to minimize data loss. This automated process ensures minimal disruption to business operations even in a single-node configuration.

The integrated backup and recovery capabilities of the Zalando operator mean these procedures require minimal manual intervention while maintaining data integrity throughout the recovery process.


## Monitoring

### Core Implementation
The Zalando Postgres Operator integrates with Prometheus and Grafana for monitoring. We set up monitoring by enabling the operator's built-in exporters and configuring Prometheus to scrape these endpoints.

### Essential Metrics

#### Database Health
- Connection pool utilization
- Database size and growth rate
- Transaction throughput and latency
- WAL generation rate
- Replication lag

#### Resource Usage
- CPU and memory consumption
- Disk IOPS and throughput
- Storage capacity and usage trends
- Connection counts

#### Backup Status
- Backup success/failure rates
- Backup duration
- WAL archiving status
- Recovery point objectives (RPO) compliance

This monitoring setup provides early warning of potential issues while helping maintain optimal database performance and reliability. The Zalando operator's integration with standard monitoring tools makes implementation straightforward.



## Storage Class Selection for PostgreSQL Databases

### Recommended Choice: Longhorn
For our Hetzner-hosted PostgreSQL databases, we recommend using the pre-installed Longhorn storage class. 

### Rationale
Longhorn provides the best balance of features for our use case:
- Already pre-installed, eliminating additional complexity
- Supports volume replication for better data protection
- Offers built-in backup and restore capabilities
- Provides better performance than hcloud_volume for database workloads

We don't recommend installing OpenEBS or other CSI drivers as they would add unnecessary complexity when Longhorn already meets our requirements efficiently.


## CDK8s vs Alternatives 

### CDK8s Experience
While CDK8s provides good TypeScript integration and abstraction capabilities, it introduces an additional layer of complexity that may not be necessary for our infrastructure needs.

### Preference for Terraform
I would prefer using Terraform with the Kubernetes provider for this implementation because:
- It integrates better with our existing infrastructure-as-code practices
- Provides more direct control over Kubernetes resources
- Has a larger ecosystem of modules and providers
- Offers better state management capabilities
- Simpler learning curve for teams already familiar with Terraform

In my opinion the added abstraction layer of CDK8s, while powerful, doesn't provide enough benefits to justify moving away from Terraform's more straightforward and widely-adopted approach to infrastructure management.