# FundTrust

> **Don’t trust us. Verify it yourself.**

FundTrust is a frontend prototype for a public fund-distribution application. It is designed to help government agencies, NGOs, beneficiaries, journalists, auditors, and citizens clearly see how aid money is assigned and distributed.

The main idea is simple: important distribution events can be recorded on a public blockchain, allowing people to verify the record for themselves instead of relying only on reports from the organisation running the program.

This repository currently contains the **user interface and user experience** for FundTrust. It uses mock data and simulated wallet/transaction states. It is **not yet connected** to a live blockchain, smart contract, backend, payment system, or real MetaMask wallet.

---

## What problem does FundTrust solve?

Aid and public-fund programs often rely on internal databases, spreadsheets, paper records, and reports published long after money has been distributed. This can make it difficult for the public to answer important questions:

- Was this aid program really created?
- How much money was allocated?
- Has the money been released?
- Is there a transaction record for the release?
- Has the beneficiary confirmed receiving the support?
- Can a citizen verify the information without asking the organisation?

FundTrust is designed to make these answers easier to find.

Instead of asking citizens to simply trust the institution managing funds, FundTrust provides a public verification experience. A person can search for a program or transaction record, or scan a QR code in a real deployment, and view the relevant public information.

The design avoids complicated crypto language. Blockchain is treated as background technology for accountability, not as something users need to understand before they can use the product.

---

## Who uses FundTrust?

FundTrust supports three main user groups.

### 1. Program Managers

Program Managers are people working for government agencies, NGOs, charities, or other organisations that run aid programs.

They use FundTrust to:

- View active fund-distribution programs
- Track allocated budgets
- Review releases and transactions
- Monitor program activity
- Search and filter program information
- Generate public verification links or QR-code entry points
- Sign authorised actions using MetaMask in a future live version

In a real deployment, Program Managers would connect MetaMask to prove that they control an authorised wallet. Actions such as creating a program, allocating a budget, or releasing funds would require a wallet signature.

### 2. Beneficiaries

Beneficiaries are people or groups receiving support through a program.

They use FundTrust to:

- Connect their assigned wallet
- See the programs they are enrolled in
- View the amount assigned to them
- Check expected release dates
- Follow the status of the distribution
- Confirm they received funds or support

The Beneficiary Portal uses clear labels and a simple timeline so people do not need blockchain knowledge to understand their status.

### 3. The Public

The public includes citizens, journalists, researchers, auditors, oversight teams, and anyone interested in checking how a program is progressing.

Public users can:

- Verify a program without creating an account
- Search using a program ID or transaction ID
- Check public status information
- View transaction records and block details
- Use the explorer to review available records

A wallet is **not required** for public verification.

---

## Main features

### Public verification without a wallet

Anyone can use the **Public Verification** page. They can enter a Program ID, Transaction ID, or program search term and view the available public record.

The verification result can show:

- Program name
- Program status
- Budget and released amount
- Distribution timeline
- Transaction ID
- Block number
- Timestamp
- Network information
- Verification status

This is the main trust feature of FundTrust: citizens should be able to verify public information independently.

### Program Manager Dashboard

The Program Manager Dashboard provides an operational view of the platform.

It includes four sections:

#### Overview

The overview shows important summary information, including:

- Total programs
- Active programs
- Budget information
- Distribution progress
- Recent activity
- Program progress indicators

#### Programs

The Programs area contains a searchable and filterable list of programs.

Managers can review:

- Program names
- Program IDs
- Current status
- Budget details
- Progress
- Public-verification options
- Explorer links

#### Transactions

The Transactions area presents a record of fund releases.

It can show:

- Transaction IDs
- Program names
- Recipient wallet addresses
- Release amounts
- Confirmation status
- Block numbers
- Transaction dates

#### Activity

The Activity area is a chronological feed of events in the system, such as program creation, fund allocation, releases, confirmations, and verification activity.

### Beneficiary Portal

The Beneficiary Portal is a focused interface for recipients of aid.

It can show:

- Connected wallet identity
- Programs assigned to the beneficiary
- Allocation amount
- Release date
- Current distribution status
- A progress timeline
- A confirmation action when support has been received

The status timeline follows four stages:

1. Program created
2. Budget allocated
3. Funds released
4. Receipt confirmed

### Public Explorer

The Explorer allows people to browse and search available transaction data.

Users can:

- Search by transaction ID
- Search by wallet address
- Search by program name
- Filter by transaction status
- Review confirmed, pending, or failed entries
- Export visible records to CSV

### QR-code verification support

FundTrust is designed to support QR-based public verification.

In a live implementation, QR codes could be printed on:

- Public notices
- Aid receipts
- Program posters
- Beneficiary documents
- Reports
- Community information boards

Scanning the code would open the relevant public verification record.

### Educational pages

FundTrust contains dedicated pages that explain the product clearly.

#### How It Works

This page explains the four-step distribution process:

1. Program created
2. Budget allocated
3. Funds released
4. Receipt confirmed

#### Features

This page presents the key platform capabilities, such as:

- Transparency
- Security
- Accessibility
- Monitoring
- Oversight
- Identity
- Distribution
- Authorisation
- Speed

#### Why Blockchain

This page explains why a public, tamper-resistant record can support public accountability.

It covers concepts such as:

- Immutability
- Transparency
- Decentralisation
- Cryptographic authorisation

It also compares FundTrust with traditional record-keeping approaches.

---

## How to use FundTrust

### How a citizen verifies a program or payment

1. Open FundTrust.
2. Select **Verify** or go to **Public Verification**.
3. Enter a Program ID or Transaction ID.
4. Review the verification result.
5. Check the program status, amount, timeline, transaction information, and block details.
6. Open the Explorer if more transaction context is needed.

No account, password, or wallet is required.

### How a Program Manager uses the dashboard

1. Open FundTrust.
2. Choose the **Program Manager** experience.
3. Select **Connect MetaMask**.
4. In a real version, approve the wallet connection in MetaMask.
5. Review the overview for active programs and recent activity.
6. Open **Programs** to search and filter fund programs.
7. Open **Transactions** to review released funds and transaction statuses.
8. Use public verification or the explorer when a shareable record is needed.

In the current prototype, wallet connection is simulated.

### How a Beneficiary checks their support

1. Open the **Beneficiary Portal**.
2. Connect the assigned wallet.
3. Review the available program information.
4. Check the assigned amount and release date.
5. Follow the progress timeline.
6. When support is available, select **Confirm receipt**.
7. In a real version, approve the confirmation with MetaMask.

---

## How the fund-distribution process works

FundTrust presents aid distribution in four clear stages.

### 1. Program created

An authorised organisation creates a fund-distribution program and records its basic details.

### 2. Budget allocated

The organisation assigns money to the program or eligible beneficiary group.

### 3. Funds released

The funds are released. In a live blockchain version, this event would create a public transaction record.

### 4. Receipt confirmed

The beneficiary confirms that support has been received, completing the visible distribution record.

In a production version, smart contracts would define the exact rules for each stage.

---

## Wallet connection and privacy

FundTrust uses wallet-based authorisation for actions that require permission.

### What MetaMask would do in a live version

MetaMask would allow authorised users to:

- Connect their wallet address
- Approve or reject actions
- Sign transactions
- Confirm that they control the wallet
- Submit actions to the selected blockchain network

FundTrust would never need access to a user’s private key.

### Privacy warning

A public blockchain should **not** store sensitive personal information.

A real FundTrust system should not place the following information directly on-chain:

- Full names
- Home addresses
- National ID numbers
- Medical information
- Bank details
- Sensitive eligibility data
- Private beneficiary records

Instead, a production system should store only the minimum public information or cryptographic proof needed for verification. Sensitive records should be protected in secure off-chain systems.

---

## Technology used

FundTrust uses:

- **React 18** for the application interface
- **TypeScript** for typed application code
- **Vite** for development and builds
- **Tailwind CSS** for responsive styling
- **Lucide React** for interface icons
- **Motion** for transitions and animation
- **Radix UI** primitives for accessible UI components

The visual design uses a calm, institutional style with navy and emerald colors, clear typography, accessible contrast, and straightforward language.

The goal is to make public accountability feel credible and understandable, without crypto-trading visuals or unnecessary jargon.

---

## Project structure

```text
.
├── src/
│   ├── app/
│   │   ├── App.tsx             # Main FundTrust application and screen logic
│   │   └── components/ui/      # Reusable UI components
│   └── styles/
│       ├── fonts.css           # Font imports
│       ├── theme.css           # Design tokens and colors
│       ├── index.css           # Tailwind setup
│       └── globals.css         # Global project styles
├── README.md                   # Project documentation
├── package.json                # Dependencies and scripts
├── vite.config.ts              # Vite configuration
├── postcss.config.mjs          # PostCSS configuration
├── __figma__entrypoint__.ts    # Figma Make entry point
└── ATTRIBUTIONS.md             # Third-party attribution information
