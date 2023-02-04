<div id="top"></div>

<!-- PROJECT LOGO -->
<br />

<div align="center">
  <a>
    <img src="https://github.com/BHouwens/Nation/blob/main/assets/hero.svg" alt="Logo" width="250px">
  </a>

  <div style="height: 20px; width: 100%"></div>

  <h3>Nation Voting Server</h3>

  <div>
  <img src="https://img.shields.io/github/actions/workflow/status/BHouwens/Nation/codeql-analysis.yml?branch=main" alt="Pipeline Status" />
    <img src="https://img.shields.io/github/package-json/v/Zenotta/Intercom" />
  </div>

  <p align="center">
    A small utility server to exchange arbitrary data between clients. Comes complete with E2E public key encryption
    <br />
    <br />
    <a href="https://zenotta.io"><strong>Official documentation »</strong></a>
    <br />
    <br />
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#running-the-server">Running The Server</a></li>
        </ul>
    </li>
    <li>
      <a href="#how-it-works">How it Works</a>
      <ul>
        <li><a href="#data-exchange">Data Exchange</a></li>
        <li><a href="#security">Security</a></li>
        <li><a href="#memory-management">Memory Management</a></li>
        </ul>
    </li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## About The Project

This utility server aims to ease the exchange of arbitrary data between clients. For Zenotta's blockchain, you can use this intercom server in order to facilitate receipt-based transactions between parties.

..

<!-- GETTING STARTED -->

## Getting Started

### 📚 Prerequisites

In order to run this server as a community provider, or simply to use it yourself, you'll need to have <a href="https://www.docker.com/products/docker-desktop/">Docker</a> installed (minimum tested v20.10.12) and be comfortable working with the command line. 

If you'd like to develop on this repo, you'll have the following additional requirements:

- **NodeJs** (tested at v14.16.0)
- **Yarn** (tested at v1.22.10)

..

<p align="left">(<a href="#top">back to top</a>)</p>

..

### 🔧 Installation

With Docker installed and running, you can clone this repo and get everything installed with the following:

```sh
# SSH clone
git clone git@gitlab.com:zenotta/zenotta-intercom.git

# Navigate to the repo
cd zenotta-intercom

# Install dependencies
npm install

# Bundle server
npm run build

# Build Docker image
docker build -t intercom .
```

<p align="left">(<a href="#top">back to top</a>)</p>

..

### 🏎️ Running

To use the server as is, you can simply run the following in the root folder of the repo:

```sh
docker-compose up -d
```

or, if you are able to run bash scripts:

```sh
cd zenotta-intercom

sh exec_docker.sh
```

Docker will orchestrate both the server itself and the Redis instance, after which you can make 
calls to your server at port **3002**. Data saved to the Redis instance is kept within a Docker volume.

To run the server in a development environment, run the following command:
```sh
npm install

npm run dev
```

or with Yarn:

```sh
yarn install

yarn run dev
```

<p align="left">(<a href="#top">back to top</a>)</p>

..

## How it Works

*Nomenclature: "Alice" and "Bob" represent unique public key addresses.*

### Data Exchange
The server functions on a very basic set of rules. Clients exchange data between each other through the use of public key addresses. If Alice wants to exchange data with Bob, she would place a Redis **field** value containing the data being exchanged under a Redis **key** value representing Bob's public key address. The next time Bob fetches data from the server using his public key address, he would find that Alice has exchanged data to him.

<details>
<summary> An Example </summary>
<br/>

```json
{
    "c9f97...2d872": {
        "timestamp": 1647525607766,
        "value": {
            "DRUID0x5d382e4ab": {
                "senderAsset": "Token",
                "senderAmount": 10,
                "senderAddress": "bd696...0e80c",
                "receiverAsset": "Receipt",
                "receiverAmount": 1,
                "receiverAddress": "c9f97...2d872",
                "fromAddr": "bd696...0e80c",
                "status": "pending"
            }
        }
    }
}
```

In this example, data for a receipt-based payment was exchanged to Bob (```bd696...0e80c```) from Alice (```c9f97...2d872```).

Bob would retrieve all data exchanged to him through proving that he owns the address ```bd696...0e80c``` by cryptographically signing for it. This address represents a **key** value on the Redis server.

Retrieval of all **field** values corresponding to the **key** (Bob's address), shows that we obtain an object structure with a parent object key value representing the address (Alice) from which the data is being exchanged. This object also contains a timestamp value to indicate when the data was exchanged.

When Bob responds by exchanging data back to Alice, the data that Alice has initially exchanged to Bob will be removed from the Redis server for sanitation purposes.

</details>

### Available Routes

- `set_data`: Sets data in the Redis instance and marks it for pending retrieval in the server
- `get_data`: Gets pending data from the server

### Security

This server supports basic authentication through the use of cryptographic signatures and also features an IP-based rate-limiting mechanism. Other minor features include request body structure verification, compression middleware, and a request body size limitation.

### Memory Management

Since this server relies on Redis as an in-memory database, it is imperative that Redis entries are discarded when no longer deemed valuable.

The server aims to achieve this through the following:
<ol>
<li>
Redis keys are set to expire after a certain amount of time.
<li>
Relevant Redis keys are checked for their expiration each time a request is processed on the server.
</li>
<li>
Data exchange is unidirectional in nature: When Alice exchanges data with Bob, the data Alice has exchanged to Bob will be removed from Bob's Redis **key** entry once Bob responds by exchanging data back to Alice's corresponding address.
</li>
<li>
Data exchange does not allow queuing: Only one set of data may be exchanged from Alice to Bob (or vice versa) at a time. If Alice should exchange different sets of data to Bob in quick succession, only the latest set data will be stored for Bob to retrieve.
</li>
</ol>
