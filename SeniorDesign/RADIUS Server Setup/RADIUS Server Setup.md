# RADIUS Server Setup  
##   
## **==Part 1: FreeRadius Inititalization==**  
### Step 1:  
```
    sudo su

```
```
    sudo dnf update -y  
    sudo dnf check update 

```
> Ensures the system packages are fully updated before installing FreeRADIUS.  
> 
> Running updates as root (sudo su) guarantees consistent permission handling during setup.  

    
### Step 2:  
```
    dnf install freeradius 

```
> Installs the FreeRADIUS server and all necessary dependencies.  
  
### Step 3:  
```
    systemctl enable radiusd.service  

```
> Enables the FreeRADIUS service to start automatically on system boot.  
  
### Step 4:  
```
    cd /etc/raddb/certs 
    nano ca.cnf 

```
> Navigates to the certificates directory.  
> 
> Opens the Certificate Authority configuration file (ca.cnf) for editing.  
> 
> Under [certificate authority], update relevant identification fields (like organization, email, etc.) to reflect your setup.  

    
### Step 5:  
```
    nano server.cnf 

```
> Opens the server certificate configuration file.  
> 
> Modify the [server] section to match your server’s identity details.  

    
### Step 6:  
```
    nano client.cnf 

```
> Opens the client certificate configuration file.  
> 
> Edit the [client] section to define client certificate attributes.  

    
### Step 7:  
```
    make all 

```
> Builds and signs the CA, server, and client certificates using the configurations we just edited.  
  
**++==Note: ==++**  
When reinitializing the server from scratch, the CA might retain old certificate data. To reset the certificate database completely:  
```
    cd /etc/raddb/certs 
    sudo rm -f index.txt* 
    sudo touch index.txt 
    sudo echo "unique subject = no" > index.txt.attr 
    sudo make all  

```
> Removes old index files used by OpenSSL for certificate tracking.  
> 
> Recreates a clean index file and allows duplicate certificate subjects.  
> 
> Rebuilds all certificates to start fresh.  

    
**++==Permission Fix: ==++**  
If running radiusd -X returns a “permission denied” error for /mods-config/files/authorize, apply the following fixes:  
```
    sudo chown -R radiusd:radiusd /etc/raddb 
    sudo find /etc/raddb -type f -exec chmod 640 {} \; 
    sudo find /etc/raddb -type d -exec chmod 750 {} \;  

```
> Assigns proper ownership of all configuration files to the radiusd user and group.  
> 
> Ensures correct file (640) and directory (750) permissions for FreeRADIUS to read configurations securely.  
  
  
## **==Part 2: Client Connection Setup==**  
### Step 1:  
```
    nano clients.conf 

```
> Opens the client configuration file to define trusted RADIUS clients.  
  
### Step 2:  
Example test client entry to add in clients.conf file.  
```
    client justin {  
        ipaddr = 34567u76\ 
        secret = whatever 
    } 

```
> Defines a test client with its IP address and shared secret.  
> 
> This secret must match the one used by the client when sending authentication requests.  

    
### Step 3:  
```
    nano /etc/raddb/mods-config/files/authorize 

```
> Opens the user authorization file to define local test accounts for authentication.  
  
### Step 4:  
Example test entries to add in authorize file.  
```
    justin    Cleartext-Password := test   
    guru      Cleartext-Password := test

```
> Creates two test users (justin and guru) with plaintext passwords for simple authentication testing.  
  
### Step 5:  
Now run the RADIUS server  
```
    radiusd -X

```
  
**++==Note:==++**  
When having issues with starting radiusd -X due to port being used:  
```
    sudo lsof -i :1812 1813 

```
Lists processes currently using the RADIUS ports (1812 for authentication, 1813 for accounting).  
Useful for identifying and stopping any running instances that block radiusd -X from starting.  
