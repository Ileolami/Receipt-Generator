import { useState } from "react";
import Web3 from "web3";
import { jsPDF } from "jspdf";
import { QRCodeSVG } from "qrcode.react";

const TransactionReceipt = () => {
  const [transactionId, setTransactionId] = useState("");
  interface TransactionDetails {
    transactionHash: string;
    from: string;
    to: string;
    cumulativeGasUsed: number;
    blockNumber: number;
    contractAddress?: string;
  }
 


  const [transactionDetails, setTransactionDetails] =
    useState<TransactionDetails | null>(null);
  const [error, setError] = useState("");

  const web3 = new Web3(
    `https://rpc.testnet.rootstock.io/${import.meta.env.VITE_API_KEY}`
  );

  const fetchTransactionDetails = async () => {
    try {
      setError("");
      setTransactionDetails(null);

      const receipt = await web3.eth.getTransactionReceipt(transactionId);

      if (!receipt) {
        throw new Error("Transaction not found!");
      }
      
      setTransactionDetails({
        ...receipt,
        cumulativeGasUsed: Number(receipt.cumulativeGasUsed),
        blockNumber: Number(receipt.blockNumber),
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  const generatePDF = () => {
    if (!transactionDetails) return;

    const {
      transactionHash,
      from,
      to,
      cumulativeGasUsed,
      blockNumber,
      contractAddress,
    } = transactionDetails;
    const pdf = new jsPDF();

    pdf.setFontSize(16);
    pdf.text("Transaction Receipt", 10, 10);

    pdf.setFontSize(12);
    pdf.text(`Transaction Hash: ${transactionHash}`, 10, 20);
    pdf.text(`From: ${from}`, 10, 30);
    pdf.text(`Contract Address: ${contractAddress}`, 10, 40);
    pdf.text(`To: ${to}`, 10, 40);
    pdf.text(`Cumulative Gas Used: ${cumulativeGasUsed}`, 10, 50);
    pdf.text(`Block Number: ${blockNumber}`, 10, 60);

    pdf.save("Transaction_Receipt.pdf");
  };

  return (
    <div className="p-8 font-sans bg-gray-100 min-h-screen">
      <div className="max-w-3xl m-auto bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">
          Transaction Receipt Generator
        </h1>

        <div className="mb-6">
          <div className="flex">
            <input
              type="text"
              id="transactionId"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Enter transaction hash"
              className="border p-2 w-full rounded-l-lg"
            />
            <button
              onClick={fetchTransactionDetails}
              className="p-2 bg-blue-500 text-white rounded-r-lg"
            >
              Fetch Details
            </button>
          </div>
        </div>

        {error && (
          <p className="text-red-500 mt-4 text-center">Error: {error}</p>
        )}

        {transactionDetails && (
          <div className="mt-6 flex flex-row gap-8">
            <div className="w-2/3">
              <h2 className="text-2xl font-semibold mb-4 text-center">
                Transaction Details
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg shadow-inner w-[460px]">
                <p>
                  <strong>Transaction Hash:</strong>{" "}
                  {`${transactionDetails.transactionHash.slice(
                    0,
                    6
                  )}...${transactionDetails.transactionHash.slice(-6)}`}
                </p>
                <p>
                  <strong>From:</strong> {transactionDetails.from}
                </p>
                <p>
                  <strong>Contract Address:</strong>{" "}
                  {transactionDetails.contractAddress}
                </p>
                <p>
                  <strong>To:</strong> {transactionDetails.to}
                </p>
                <p>
                  <strong>Cumulative Gas Used:</strong>{" "}
                  {transactionDetails.cumulativeGasUsed.toString()}
                </p>
                <p>
                  <strong>Block Number:</strong>{" "}
                  {transactionDetails.blockNumber.toString()}
                </p>
              </div>

              <button
                onClick={generatePDF}
                className="mt-6 w-full p-3 bg-green-500 text-white rounded-lg"
              >
                Download PDF Receipt
              </button>
            </div>
            <div className="w-1/2 text-center">
              <h3 className="text-xl font-semibold mb-4">QR Code</h3>
              <QRCodeSVG
                value={`Transaction Hash: ${
                  transactionDetails.transactionHash
                }, 
                  From: ${transactionDetails.from}, 
                  To: ${transactionDetails.to},
                  Contract Address: ${transactionDetails.contractAddress},
                  Cumulative Gas Used: ${transactionDetails.cumulativeGasUsed.toString()}, 
                  Block Number: ${transactionDetails.blockNumber.toString()}`}
                size={200}
                className="mx-auto"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionReceipt;
