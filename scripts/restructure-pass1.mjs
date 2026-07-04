#!/usr/bin/env node
/**
 * Pass 1: Rebuild cybersecurity.json hierarchy per STRUCTURE-PLAN.md
 * Structure only — leaf content unchanged.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JSON_PATH = path.join(__dirname, '../data/cybersecurity.json');

/** @typedef {{ id: string, title: string, leaves?: string[], subtopics?: { id: string, title: string, leaves: string[] }[], topics?: TopicDef[] }} TopicDef */

/** Full hierarchy: domainId -> subdomains -> topics -> optional subtopics -> leaf ids */
const HIERARCHY = {
  fundamentals: [
    {
      id: 'security-principles-models',
      title: 'Security Principles & Architectural Models',
      topics: [
        { id: 'assurance-foundations', title: 'Assurance Foundations', leaves: ['cia-triad', 'information-assurance-pillars'] },
        { id: 'defense-architecture', title: 'Defense Architecture', leaves: ['defense-in-depth', 'zero-trust-model'] },
      ],
    },
    {
      id: 'risk-threat-landscape',
      title: 'Risk, Threats & Adversaries',
      topics: [
        { id: 'risk-quantification', title: 'Risk Quantification', leaves: ['risk-threat-vulnerability-impact', 'security-core-vocabulary'] },
        { id: 'threat-actors-and-motivation', title: 'Threat Actors and Motivation', leaves: ['threat-actor-sophistication', 'attack-surface-access-vectors', 'adversary-target-system-categories'] },
      ],
    },
    {
      id: 'security-controls-governance',
      title: 'Security Controls & Governance Basics',
      topics: [
        { id: 'control-types-and-access-principles', title: 'Control Types and Access Principles', leaves: ['security-control-types', 'least-privilege-principle'] },
      ],
    },
  ],
  networks: [
    {
      id: 'network-architecture-fundamentals',
      title: 'Network Architecture & Protocols',
      topics: [
        {
          id: 'osi-and-physical-layer',
          title: 'OSI and Physical Layer',
          subtopics: [{ id: 'layer-models-and-physical', title: 'Layer Models and Physical', leaves: ['osi-model-layers', 'physical-layer-line-coding', 'ethernet-frame-structure', 'medium-access-control-csma', 'error-detection-crc-arq'] }],
        },
        {
          id: 'ip-addressing-and-routing',
          title: 'IP Addressing and Routing',
          subtopics: [{ id: 'subnetting-and-forwarding', title: 'Subnetting and Forwarding', leaves: ['ip-subnetting', 'routing-protocols-overview', 'distance-vector-loops-split-horizon', 'nat-network-address-translation'] }],
        },
        {
          id: 'transport-layer-tcp',
          title: 'Transport Layer TCP',
          subtopics: [{ id: 'tcp-mechanics', title: 'TCP Mechanics', leaves: ['tcp-segment-header', 'tcp-connection-lifecycle', 'tcp-rto-estimation', 'tcp-congestion-control', 'tcp-congestion-variants', 'socket-programming-basics'] }],
        },
      ],
    },
    {
      id: 'network-services-applications',
      title: 'Network Services & Application Protocols',
      topics: [
        { id: 'naming-and-directory-services', title: 'Naming and Directory Services', leaves: ['dns-resolution-fundamentals', 'dns-zone-transfer', 'dhcp-protocol'] },
        { id: 'application-and-email-protocols', title: 'Application and Email Protocols', leaves: ['email-security-dmarc-spf-dkim'] },
      ],
    },
    {
      id: 'network-perimeter-segmentation',
      title: 'Perimeter, Segmentation & Access Control',
      topics: [
        { id: 'firewalls-and-filtering', title: 'Firewalls and Filtering', leaves: ['firewall-fundamentals', 'iptables-stateful-filtering'] },
        { id: 'segmentation-and-access-control', title: 'Segmentation and Access Control', leaves: ['vlan-hopping', 'access-control-models'] },
      ],
    },
    {
      id: 'network-reconnaissance-attacks',
      title: 'Network Reconnaissance & Layer Attacks',
      topics: [
        { id: 'reconnaissance-and-footprinting', title: 'Reconnaissance and Footprinting', leaves: ['footprinting-reconnaissance-techniques', 'adversarial-thinking-threat-actors'] },
        { id: 'layer2-layer3-attacks', title: 'Layer 2 and Layer 3 Attacks', leaves: ['arp-spoofing-mitm', 'arp-poisoning-mitm', 'mac-flooding-cam-table', 'dns-cache-poisoning-basics'] },
      ],
    },
    {
      id: 'network-analysis-troubleshooting',
      title: 'Network Analysis & Diagnostics',
      topics: [
        { id: 'packet-capture-analysis', title: 'Packet Capture Analysis', leaves: ['wireshark-hex-header-fields', 'wireshark-display-filters', 'icmp-diagnostics-ping-traceroute'] },
      ],
    },
  ],
  systems: [
    {
      id: 'endpoint-linux-hardening',
      title: 'Endpoint & Linux Hardening',
      topics: [
        { id: 'linux-cli-fundamentals', title: 'Linux CLI Fundamentals', leaves: ['overthewire-bandit-cli-reference', 'find-permission-escalation', 'grep-recursive-content-search'] },
        { id: 'remote-access-hardening', title: 'Remote Access Hardening', leaves: ['ssh-key-auth-hardening'] },
      ],
    },
    {
      id: 'secure-software-lifecycle',
      title: 'Secure Software Development Lifecycle',
      topics: [
        { id: 'threat-modeling-and-analysis', title: 'Threat Modeling and Analysis', leaves: ['stride-threat-modeling', 'fault-tree-analysis', 'fmea-failure-mode-analysis', 'stpa-hazard-analysis'] },
        { id: 'secure-coding-practices', title: 'Secure Coding Practices', leaves: ['input-validation-boundaries', 'memory-safety-buffer-overruns', 'integer-overflow-wraparound', 'race-conditions-toctou', 'fail-secure-error-handling', 'security-code-review-checklist'] },
        { id: 'supply-chain-and-composition', title: 'Supply Chain and Composition', leaves: ['sbom-supply-chain', 'sca-dependency-scanning'] },
      ],
    },
    {
      id: 'application-security-testing',
      title: 'Application Security Testing',
      topics: [
        { id: 'testing-methodologies', title: 'Testing Methodologies', leaves: ['sast-dast-overview'] },
      ],
    },
    {
      id: 'safety-critical-systems',
      title: 'Safety-Critical & High-Assurance Systems',
      topics: [
        { id: 'standards-and-safety-levels', title: 'Standards and Safety Levels', leaves: ['iec-61508-sil-levels', 'safety-critical-v-and-v', 'software-fault-tolerance-cots-hardware'] },
        { id: 'hazard-analysis-case-studies', title: 'Hazard Analysis Case Studies', leaves: ['safety-critical-hazard-case-studies'] },
      ],
    },
  ],
  identity: [
    {
      id: 'authentication-mechanisms',
      title: 'Authentication Mechanisms',
      topics: [
        { id: 'multi-factor-and-password-policy', title: 'Multi-Factor and Password Policy', leaves: ['mfa-mechanisms', 'password-policy-vs-passwordless', 'password-attack-models-online-offline', 'password-attack-mitigations'] },
        { id: 'kerberos-and-directory-auth', title: 'Kerberos and Directory Auth', leaves: ['kerberos-ticket-flow-as-tgs-tgt'] },
        { id: 'authentication-concepts', title: 'Authentication Concepts', leaves: ['identity-authentication-fundamentals', 'aaa-access-control-model', 'authentication-failure-insight'] },
      ],
    },
    {
      id: 'federation-single-sign-on',
      title: 'Federation & Single Sign-On',
      topics: [
        { id: 'sso-protocols', title: 'SSO Protocols', leaves: ['sso-saml-oidc-basics'] },
      ],
    },
    {
      id: 'privileged-access-governance',
      title: 'Privileged Access Governance',
      topics: [
        { id: 'pam-and-jit', title: 'PAM and JIT', leaves: ['privileged-access-management', 'just-in-time-access'] },
      ],
    },
  ],
  'web-security': [
    {
      id: 'web-platform-fundamentals',
      title: 'Web Platform Fundamentals',
      topics: [
        { id: 'http-server-basics', title: 'HTTP Server Basics', leaves: ['web-fundamentals-server-config', 'web-server-attack-categories', 'owasp-top10-overview'] },
        { id: 'web-application-firewalls', title: 'Web Application Firewalls', leaves: ['firewall-vendor-landscape'] },
      ],
    },
    {
      id: 'injection-and-input-attacks',
      title: 'Injection & Input Attacks',
      topics: [
        { id: 'sql-injection', title: 'SQL Injection', leaves: ['sql-injection-union'] },
      ],
    },
    {
      id: 'client-side-attacks',
      title: 'Client-Side Attacks',
      topics: [
        { id: 'xss-and-client-execution', title: 'XSS and Client Execution', leaves: ['xss-reflected-stored', 'client-side-web-attacks'] },
      ],
    },
    {
      id: 'session-and-request-forgery',
      title: 'Session Management & Request Forgery',
      topics: [
        { id: 'session-hijacking-and-csrf', title: 'Session Hijacking and CSRF', leaves: ['cookie-poisoning-session-hijack', 'csrf-token-defense'] },
      ],
    },
    {
      id: 'web-hardening-defense',
      title: 'Web Hardening & Defensive Controls',
      topics: [
        { id: 'server-hardening-baselines', title: 'Server Hardening Baselines', leaves: ['web-hardening-baseline-apache-iis'] },
      ],
    },
  ],
  'cloud-security': [
    {
      id: 'cloud-governance-models',
      title: 'Cloud Governance & Shared Responsibility',
      topics: [
        { id: 'shared-responsibility-and-benchmarks', title: 'Shared Responsibility and Benchmarks', leaves: ['cloud-shared-responsibility', 'cis-cloud-benchmarks', 'aws-organizations-scp'] },
      ],
    },
    {
      id: 'cloud-identity-access',
      title: 'Cloud Identity & Access Management',
      topics: [
        { id: 'iam-and-key-management', title: 'IAM and Key Management', leaves: ['aws-iam-least-privilege', 'aws-kms-key-management'] },
      ],
    },
    {
      id: 'cloud-network-compute',
      title: 'Cloud Network & Compute Hardening',
      topics: [
        { id: 'network-isolation-and-compute', title: 'Network Isolation and Compute', leaves: ['aws-vpc-security-groups', 'ec2-instance-hardening', 'lambda-security-execution-role'] },
      ],
    },
    {
      id: 'cloud-data-secrets',
      title: 'Cloud Data Protection & Secrets',
      topics: [
        { id: 'storage-and-secrets', title: 'Storage and Secrets', leaves: ['s3-public-bucket-exposure', 'secrets-manager-parameter-store', 'data-loss-water-analogy'] },
      ],
    },
    {
      id: 'cloud-workloads-containers',
      title: 'Cloud Workloads, Containers & Orchestration',
      topics: [
        { id: 'containers-and-kubernetes', title: 'Containers and Kubernetes', leaves: ['container-image-scanning', 'kubernetes-rbac-basics'] },
        { id: 'application-platform-security', title: 'Application Platform Security', leaves: ['cms-security-model'] },
      ],
    },
    {
      id: 'cloud-threat-detection',
      title: 'Cloud Threat Detection & Logging',
      topics: [
        { id: 'logging-and-detection-services', title: 'Logging and Detection Services', leaves: ['cloudtrail-logging', 'cloudwatch-security-alarms', 'aws-guardduty-overview'] },
      ],
    },
  ],
  'detection-monitoring': [
    {
      id: 'digital-forensics',
      title: 'Digital Forensics',
      topics: [
        { id: 'evidence-handling', title: 'Evidence Handling', leaves: ['chain-of-custody', 'legal-issues-cybersecurity', 'forensic-tool-validation-black-box-defense'] },
        { id: 'forensic-acquisition-analysis', title: 'Forensic Acquisition Analysis', leaves: ['disk-imaging-dd', 'memory-forensics-volatility'] },
      ],
    },
    {
      id: 'security-operations-monitoring',
      title: 'Security Operations & Monitoring',
      topics: [
        { id: 'ids-ips-architecture', title: 'IDS/IPS Architecture', leaves: ['ids-functional-components', 'ids-deployment-types', 'ids-analysis-methods', 'snort-signature-basics'] },
        { id: 'detection-engineering', title: 'Detection Engineering', leaves: ['sigma-detection-rules', 'tripwire-file-integrity-monitoring'] },
        { id: 'siem-and-correlation', title: 'SIEM and Correlation', leaves: ['siem-correlation-use-cases', 'log-source-prioritization', 'unix-logging-fundamentals'] },
        {
          id: 'endpoint-and-network-visibility',
          title: 'Endpoint and Network Visibility',
          subtopics: [
            { id: 'network-visibility-tools', title: 'Network Visibility Tools', leaves: ['tcpdump-cli-packet-analysis'] },
            { id: 'endpoint-detection', title: 'Endpoint Detection', leaves: ['edr-vs-traditional-av'] },
          ],
        },
        { id: 'soc-operations', title: 'SOC Operations', leaves: ['soc-tiering-escalation', 'alert-triage-prioritization', 'honeypots-honeynets-padded-cell'] },
      ],
    },
    {
      id: 'incident-response',
      title: 'Incident Response',
      topics: [
        { id: 'ir-lifecycle', title: 'IR Lifecycle', leaves: ['ir-lifecycle-nist', 'containment-strategies', 'ir-eradication', 'ir-recovery-monitoring'] },
        { id: 'ir-preparation', title: 'IR Preparation', leaves: ['ir-preparation-runbooks', 'ir-tabletop-exercises'] },
        { id: 'ir-detection-and-triage', title: 'IR Detection and Triage', leaves: ['ir-detection-triage', 'ir-threat-hunting'] },
        { id: 'ir-evidence-and-reporting', title: 'IR Evidence and Reporting', leaves: ['ir-evidence-preservation', 'post-incident-reporting', 'ir-root-cause-analysis'] },
        { id: 'ir-governance-and-comms', title: 'IR Governance and Comms', leaves: ['ir-stakeholder-comms', 'ir-regulatory-notification', 'ir-ioc-sharing', 'ir-metrics-mttd-mttr'] },
      ],
    },
  ],
  'offensive-security': [
    {
      id: 'reconnaissance-osint',
      title: 'Reconnaissance & OSINT',
      topics: [
        { id: 'passive-and-active-recon', title: 'Passive and Active Recon', leaves: ['osint-passive-recon-toolkit', 'nmap-scanning-reference', 'shodan-asset-discovery', 'google-dorking'] },
      ],
    },
    {
      id: 'vulnerability-exploitation',
      title: 'Vulnerability Analysis & Exploitation',
      topics: [
        { id: 'memory-and-binary-exploitation', title: 'Memory and Binary Exploitation', leaves: ['buffer-overflow-stack-layout', 'rop-chains-basics', 'spectre-meltdown-primer'] },
        { id: 'exploitation-frameworks-and-scope', title: 'Exploitation Frameworks and Scope', leaves: ['metasploit-autopwn-risk-and-scope'] },
      ],
    },
    {
      id: 'post-exploitation-persistence',
      title: 'Post-Exploitation & Persistence',
      topics: [
        { id: 'privilege-escalation-and-backdoors', title: 'Privilege Escalation and Backdoors', leaves: ['privilege-escalation-paths-unpatched-software', 'command-shell-backdoors-netcat'] },
        { id: 'deception-and-honeypots', title: 'Deception and Honeypots', leaves: ['honeypots'] },
      ],
    },
    {
      id: 'offensive-wireless-attacks',
      title: 'Wireless Offensive Operations',
      topics: [
        { id: 'wireless-access-attacks', title: 'Wireless Access Attacks', leaves: ['wireless-evil-twin-rogue-ap', 'wep-cracking-legacy-risk', 'wardriving-recon-exposure', 'bluetooth-attack-families'] },
      ],
    },
  ],
  'malware-re': [
    {
      id: 'malware-classification-campaigns',
      title: 'Malware Classification & Campaigns',
      topics: [
        { id: 'malware-taxonomy-and-families', title: 'Malware Taxonomy and Families', leaves: ['malware-taxonomy', 'mobile-banking-trojan-case-study'] },
        { id: 'cyber-physical-and-disruption', title: 'Cyber-Physical and Disruption', leaves: ['cyber-physical-attack-case-studies'] },
      ],
    },
    {
      id: 'malware-analysis-methods',
      title: 'Malware Analysis Methods',
      topics: [
        { id: 'analysis-workflows', title: 'Analysis Workflows', leaves: ['static-vs-dynamic-malware-analysis', 'yara-rule-basics'] },
      ],
    },
    {
      id: 'threat-intelligence-attck',
      title: 'Threat Intelligence & ATT&CK Mapping',
      topics: [
        { id: 'adversary-goals-and-frameworks', title: 'Adversary Goals and Frameworks', leaves: ['cyber-adversary-goals-taxonomy', 'mitre-attck-mapping'] },
      ],
    },
    {
      id: 'fraud-and-social-malware',
      title: 'Fraud, Scams & Social Engineering Malware',
      topics: [
        { id: 'scams-and-bec', title: 'Scams and BEC', leaves: ['browser-lock-tech-support-scams', 'business-email-compromise-deep-dive'] },
      ],
    },
  ],
  cryptography: [
    {
      id: 'cryptographic-primitives',
      title: 'Cryptographic Primitives & Algorithms',
      topics: [
        { id: 'algorithm-fundamentals', title: 'Algorithm Fundamentals', leaves: ['cryptography-fundamentals', 'aes-modes-gcm-vs-cbc'] },
      ],
    },
    {
      id: 'pki-and-transport-security',
      title: 'PKI & Transport Security',
      topics: [
        { id: 'pki-certificates', title: 'PKI Certificates', leaves: ['pki-public-key-infrastructure', 'tls-handshake-cert-validation', 'pgp-encryption-flow'] },
      ],
    },
    {
      id: 'authentication-cryptography',
      title: 'Authentication & Credential Cryptography',
      topics: [
        { id: 'kerberos-and-token-auth', title: 'Kerberos and Token Auth', leaves: ['kerberos-protocol', 'authentication-technologies-hardware', 'unix-password-storage-cracking'] },
        { id: 'authentication-architecture', title: 'Authentication Architecture', leaves: ['host-user-authentication-directions', 'implementation-failure-category'] },
      ],
    },
    {
      id: 'data-protection-cryptography',
      title: 'Data Protection Controls',
      topics: [
        { id: 'data-loss-prevention', title: 'Data Loss Prevention', leaves: ['dlp-five-cs-data-protection'] },
      ],
    },
  ],
  'governance-risk-compliance': [
    {
      id: 'governance-frameworks',
      title: 'Governance & Security Frameworks',
      topics: [
        { id: 'frameworks-overview', title: 'Frameworks Overview', leaves: ['compliance-frameworks-overview'] },
      ],
    },
    {
      id: 'risk-management',
      title: 'Risk Management',
      topics: [
        { id: 'risk-register-and-vendors', title: 'Risk Register and Vendors', leaves: ['risk-register-basics', 'third-party-vendor-risk'] },
      ],
    },
    {
      id: 'regulatory-compliance',
      title: 'Regulatory & Industry Compliance',
      topics: [
        { id: 'industry-compliance-drivers', title: 'Industry Compliance Drivers', leaves: ['compliance-drivers-by-industry'] },
      ],
    },
    {
      id: 'security-assessment-programs',
      title: 'Security Assessment Programs',
      topics: [
        { id: 'assessment-types-and-engagement', title: 'Assessment Types and Engagement', leaves: ['vulnerability-assessment-vs-penetration-test', 'penetration-test-scope-rules-of-engagement'] },
      ],
    },
  ],
  tools: [
    {
      id: 'detection-response-platforms',
      title: 'Detection & Response Platforms',
      topics: [
        { id: 'siem-platforms', title: 'SIEM Platforms', leaves: ['siem-platform-comparison'] },
        { id: 'edr-platforms', title: 'EDR Platforms', leaves: ['edr-platform-comparison'] },
        { id: 'soar-and-workflow', title: 'SOAR and Workflow', leaves: ['soar-ticketing-basics'] },
      ],
    },
  ],
};

function makeTopic(id, title, children) {
  return { id, title, label: title, type: 'topic', children };
}

function buildTopicChildren(topicDef, leafById, usedLeaves, path) {
  const children = [];
  if (topicDef.subtopics) {
    for (const st of topicDef.subtopics) {
      const stChildren = st.leaves.map((lid) => {
        if (usedLeaves.has(lid)) throw new Error(`Duplicate leaf placement: ${lid} at ${path}/${st.id}`);
        usedLeaves.add(lid);
        const leaf = leafById.get(lid);
        if (!leaf) throw new Error(`Missing leaf: ${lid} at ${path}/${st.id}`);
        return structuredClone(leaf);
      });
      children.push(makeTopic(st.id, st.title, stChildren));
    }
  }
  if (topicDef.leaves) {
    for (const lid of topicDef.leaves) {
      if (usedLeaves.has(lid)) throw new Error(`Duplicate leaf placement: ${lid} at ${path}/${topicDef.id}`);
      usedLeaves.add(lid);
      const leaf = leafById.get(lid);
      if (!leaf) throw new Error(`Missing leaf: ${lid} at ${path}/${topicDef.id}`);
      children.push(structuredClone(leaf));
    }
  }
  return children;
}

function buildDomain(domainNode, subdomains, leafById, usedLeaves) {
  const children = subdomains.map((sd) => {
    const topicChildren = sd.topics.map((t) => {
      const kids = buildTopicChildren(t, leafById, usedLeaves, `${domainNode.id}/${sd.id}/${t.id}`);
      return makeTopic(t.id, t.title, kids);
    });
    return makeTopic(sd.id, sd.title, topicChildren);
  });
  return { ...domainNode, children };
}

function collectLeaves(node, map) {
  for (const c of node.children || []) {
    if ((c.children || []).length === 0 && c.type && !['domain', 'topic', 'root'].includes(c.type)) {
      if (map.has(c.id)) throw new Error(`Duplicate leaf id in source: ${c.id}`);
      map.set(c.id, c);
    } else {
      collectLeaves(c, map);
    }
  }
}

function countNodes(node, stats = { domains: 0, subdomains: 0, topics: 0, subtopics: 0, leaves: 0, maxDepth: 0 }, depth = 0, underDomain = false) {
  stats.maxDepth = Math.max(stats.maxDepth, depth);
  const kids = node.children || [];
  if (node.type === 'domain') {
    stats.domains += 1;
    kids.forEach((c) => countNodes(c, stats, depth + 1, true));
    return stats;
  }
  if (node.type === 'topic' && kids.length) {
    const hasTopicChild = kids.some((k) => k.type === 'topic');
    const hasLeafChild = kids.some((k) => k.type !== 'topic');
    if (underDomain && depth === 2) stats.subdomains += 1;
    else if (hasTopicChild && !hasLeafChild) stats.topics += 1;
    else if (hasTopicChild && hasLeafChild) stats.subtopics += 1;
    else if (!underDomain || depth > 2) stats.topics += 1;
    kids.forEach((c) => countNodes(c, stats, depth + 1, underDomain));
    return stats;
  }
  if (!kids.length && node.type !== 'root' && node.type !== 'domain' && node.type !== 'topic') stats.leaves += 1;
  return stats;
}

function leafPaths(node, chain = [], out = new Map()) {
  const here = [...chain, node.id];
  if ((node.children || []).length === 0 && node.type && !['domain', 'topic', 'root'].includes(node.type)) {
    out.set(node.id, here.join(' > '));
  } else {
    (node.children || []).forEach((c) => leafPaths(c, here, out));
  }
  return out;
}

const raw = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
const leafById = new Map();
collectLeaves(raw.root, leafById);
console.log('Baseline leaf count:', leafById.size);
if (leafById.size !== 180) {
  console.error('ABORT: expected 180 leaves');
  process.exit(1);
}

const usedLeaves = new Set();
const newDomains = raw.root.children.map((domain) => {
  const spec = HIERARCHY[domain.id];
  if (!spec) throw new Error(`No hierarchy spec for domain ${domain.id}`);
  const { children, ...rest } = domain;
  return buildDomain(rest, spec, leafById, usedLeaves);
});

if (usedLeaves.size !== 180) {
  const missing = [...leafById.keys()].filter((id) => !usedLeaves.has(id));
  const extra = [...usedLeaves].filter((id) => !leafById.has(id));
  console.error('Leaf placement mismatch. missing:', missing, 'extra:', extra);
  process.exit(1);
}

const rebuilt = {
  ...raw,
  lastBuilt: new Date().toISOString(),
  root: { ...raw.root, children: newDomains },
};

let maxDepth = 0;
function depth(n, d = 0) { maxDepth = Math.max(maxDepth, d); (n.children || []).forEach((c) => depth(c, d + 1)); }
depth(rebuilt.root);

const stats = { domains: 0, subdomains: 0, topics: 0, subtopics: 0, leaves: 0, maxDepth: 0 };
rebuilt.root.children.forEach((d) => countNodes(d, stats, 1));

console.log('\n=== PASS 1 RESULTS ===');
console.log('Leaves placed:', usedLeaves.size);
console.log('Max depth from root:', maxDepth);
console.log('Per-domain leaf counts:');
for (const d of rebuilt.root.children) {
  let lc = 0;
  function c(n) { (n.children || []).forEach((x) => { if (!x.children?.length && x.type !== 'topic' && x.type !== 'domain') lc++; else c(x); }); }
  c(d);
  console.log(`  ${d.id}: ${lc} leaves, ${d.children.length} subdomains`);
}

fs.writeFileSync(JSON_PATH, `${JSON.stringify(rebuilt, null, 2)}\n`);
console.log('\nWrote', JSON_PATH);
