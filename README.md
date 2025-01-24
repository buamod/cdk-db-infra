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

bashCopy# Install PostgreSQL CRD
kubectl apply -f https://raw.githubusercontent.com/zalando/postgres-operator/master/manifests/postgresql.crd.yaml

### Install Operator Configuration CRD

```kubectl apply -f https://raw.githubusercontent.com/zalando/postgres-operator/master/manifests/operatorconfiguration.crd.yaml```

### Synthesize and deploy:

```npx cdk8s synth```

### Apply the generated manifests
```kubectl apply -f dist/```