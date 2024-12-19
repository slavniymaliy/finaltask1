"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Адрес вашего контракта CharityFund
const contractABI = [
  // ABI для необходимых функций
  {
    "inputs": [{ "internalType": "address[]", "name": "_approvers", "type": "address[]" }],
    "stateMutability": "nonpayable",
    "type": "constructor",
  },
  {
    "inputs": [{ "internalType": "string", "name": "name", "type": "string" }, { "internalType": "address payable", "name": "owner", "type": "address" }],
    "name": "createProject",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function",
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "projectId", "type": "uint256" }],
    "name": "donate",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function",
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "projectId", "type": "uint256" }],
    "name": "projects",
    "outputs": [
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "uint256", "name": "totalDonations", "type": "uint256" },
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "bool", "name": "isActive", "type": "bool" },
    ],
    "stateMutability": "view",
    "type": "function",
  },
  {
    "inputs": [],
    "name": "projectCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function",
  },
];

export default function Page() {
  const [provider, setProvider] = useState<any>(null);
  const [signer, setSigner] = useState<any>(null);
  const [contract, setContract] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [newProjectName, setNewProjectName] = useState("");
  const [donationAmount, setDonationAmount] = useState("");
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const prov = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(prov);
        setSigner(prov.getSigner());
        const charityContract = new ethers.Contract(contractAddress, contractABI, prov.getSigner());
        setContract(charityContract);
      } catch (err: any) {
        console.error("Error initializing provider:", err);
        setError("Failed to initialize Ethereum provider. Check console for details.");
      }
    } else {
      setError("MetaMask not detected. Please install MetaMask.");
    }
  }, []);

  const fetchProjects = async () => {
    if (!contract) return;
    const count = await contract.projectCount();
    const fetchedProjects = [];
    for (let i = 0; i < count; i++) {
      const project = await contract.projects(i);
      fetchedProjects.push({ id: i, ...project });
    }
    setProjects(fetchedProjects);
  };

  const createProject = async () => {
    if (!contract || !newProjectName) return;
    try {
      const owner = await signer.getAddress();
      const tx = await contract.createProject(newProjectName, owner);
      await tx.wait();
      setNewProjectName("");
      fetchProjects();
    } catch (err: any) {
      console.error("Error creating project:", err);
      setError("Failed to create project. Check console for details.");
    }
  };

  const donateToProject = async () => {
    if (!contract || selectedProject === null || !donationAmount) return;
    try {
      const tx = await contract.donate(selectedProject, {
        value: ethers.utils.parseEther(donationAmount),
      });
      await tx.wait();
      setDonationAmount("");
      fetchProjects();
    } catch (err: any) {
      console.error("Error donating to project:", err);
      setError("Failed to donate. Check console for details.");
    }
  };

  useEffect(() => {
    if (contract) fetchProjects();
  }, [contract]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Charity Fund</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <section>
        <h2>Create Project</h2>
        <input
          type="text"
          placeholder="Project Name"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
        />
        <button onClick={createProject}>Create</button>
      </section>

      <section>
        <h2>Projects</h2>
        {projects.length === 0 ? (
          <p>No projects available</p>
        ) : (
          <ul>
            {projects.map((project) => (
              <li key={project.id}>
                <strong>{project.name}</strong> - Donations:{" "}
                {ethers.utils.formatEther(project.totalDonations)} ETH
                <br />
                Owner: {project.owner} | Status: {project.isActive ? "Active" : "Inactive"}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>Donate</h2>
        <select onChange={(e) => setSelectedProject(Number(e.target.value))} defaultValue="">
          <option value="" disabled>
            Select Project
          </option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Amount in ETH"
          value={donationAmount}
          onChange={(e) => setDonationAmount(e.target.value)}
        />
        <button onClick={donateToProject}>Donate</button>
      </section>
    </div>
  );
}
