# Simple IP Reporter

Simple IP reporter is a small, basic script that will scan your local environment within a set range. The script will export an excel file with the information it has scanned and captured. This has similar features as one's router or network interface, however running small periodic reports like this work really well for maintaining small home networks. Particually for smart / iot devices which may have IP addresses that jump around due to DHCP leases.

## Run from Executable

1. Download latest release for your correct platform.
2. Run the executable in a directory where you have read/write permissions (either double click or run from console)

## Run from NodeJS

> Requires NODEJS / NPM for running from source

1. Downlaod source from this Git and extract the contents to a directory
2. ```cd``` to directory, and run ```npm install```
3. Once finished, proceed to run ```node main.js```
