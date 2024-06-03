"use client";

import { useState } from 'react';

const openspv = require('openspv')

const masterPath = 'm/44/0/0';

function normalise(input: string): string {
  return input
    .toLowerCase() // Convert to lowercase
    .replace(/[^a-z\s]/gi, '') // Remove non-alphabetic characters
    .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
    .trim(); // Trim leading and trailing spaces
}

export default function Home() {
  const [mnemonic, setMnemonic] = useState('');
  const [walletInfo, setWalletInfo] = useState<any>(null);

  const handleSubmit = (e: any) => {
    e.preventDefault();

    try {
      let derived = openspv.Bip39.fromString(normalise(mnemonic));
      let mnem = derived.mnemonic;
      const seed = derived.toSeed();

      // HD wallet
      const bip32 = openspv.Bip32.fromSeed(seed);

      // Master account
      const xpriv = bip32.derive(masterPath);
      const xpub = xpriv.toPublic().toString();

      const children: any[] = []
      for (let i = 0; i < 1000; i++) {
        const child = xpriv.deriveChild(i)
        children.push({
          idx: child.childIndex,
          priv: child.privKey.toWif(),
          addr: openspv.Address.fromPrivKey(child.privKey).toString()
        })
      }

      setWalletInfo({
        mnemonic: mnem,
        masterPrivKeyXpriv: xpriv.toString(),
        masterPubKeyXpub: xpub.toString(),
        children: children
      })
    } catch (err: any) {
      //setWalletInfo(null)
      throw err
    }
  };

  return (
    <div>
      <h1>Enter Seed Phrase</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={mnemonic}
          onChange={(e) => setMnemonic(e.target.value)}
          placeholder="Enter your mnemonic seed phrase"
        />
        <button type="submit">Confirm</button>
      </form>
      {walletInfo && (
        <div>
          <h2>Info (BIP-32):</h2>
          <div><b>Mnemonic (BIP-39):</b> <br /> {walletInfo.mnemonic}</div>
          <div><b>Master Private Key (XPriv):</b> <br /> {walletInfo.masterPrivKeyXpriv}</div>
          <div><b>Master Public Key (XPub):</b> <br /> {walletInfo.masterPubKeyXpub}</div>
          <br />
          <h2>Sample of Derived Addresses:</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Index</th>
                  <th>Private Key</th>
                  <th>Address</th>
                </tr>
              </thead>
              <tbody>
                {walletInfo.children.map((child: any, index: number) => {
                  return (
                    <tr key={index}>
                      <td>{child.idx}</td>
                      <td>{child.priv}</td>
                      <td>{child.addr}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
