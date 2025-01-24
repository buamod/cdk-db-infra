# K3d Setup and Usage Guide

## 1. Install K3d on macOS

To install `k3d` on macOS, follow these steps:

### Using Homebrew
```sh
brew install k3d
```

### Verify Installation
After installation, check if `k3d` is installed by running:
```sh
k3d version
```

Expected output (example):
```
k3d version v5.x.x
k3s version v1.xx.x (default)
```

---

## 2. Create a Multi-Node Kubernetes Cluster

### Step 1: Create the Cluster
To create a multi-node cluster (1 control plane and 2 worker nodes):
```sh
k3d cluster create my-cluster --agents 2
```

This command creates:
- One control plane node.
- Two worker nodes.

### Step 2: Verify Cluster Creation
List all available clusters:
```sh
k3d cluster list
```

Expected output:
```
NAME         SERVERS   AGENTS   LOADBALANCER
my-cluster   1         2        true
```

### Step 3: Check Nodes in the Cluster
Use `kubectl` to check node readiness:
```sh
kubectl get nodes
```

Expected output:
```
NAME                    STATUS   ROLES                  AGE   VERSION
k3d-my-cluster-server   Ready    control-plane,master   1m    v1.xx.x
k3d-my-cluster-agent-0  Ready    <none>                 1m    v1.xx.x
k3d-my-cluster-agent-1  Ready    <none>                 1m    v1.xx.x
```

---

## 3. Test the Cluster

### Step 1: Deploy a Test Pod
Run the following command to create a test pod:
```sh
kubectl run test-pod --image=nginx --restart=Never
```

Check if the pod is running:
```sh
kubectl get pods
```

Expected output:
```
NAME        READY   STATUS    RESTARTS   AGE
test-pod    1/1     Running   0          5s
```

### Step 2: Delete the Test Pod
Once you've verified the cluster, delete the test pod:
```sh
kubectl delete pod test-pod
```

Verify the pod has been deleted:
```sh
kubectl get pods
```

---

## 4. Cleaning Up

If you no longer need the cluster, you can delete it:
```sh
k3d cluster delete my-cluster
```

Verify the cluster is removed:
```sh
k3d cluster list
```

Expected output:
```
No clusters found
```