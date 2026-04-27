import { SkillStep } from '../types';

const get6Subtopics = (base: string[]) => {
  const topics = [...base];
  while (topics.length < 6) topics.push(`${topics[0]} Advanced ${topics.length + 1}`);
  return topics.slice(0, 6);
};

export const roleRoadmaps: Record<string, SkillStep[]> = {
  "DATA ANALYST": [
    { topic: "SQL & Databases", duration: "WEEK 1", description: "Master queries & aggregations.", subtopics: get6Subtopics(["SELECT/WHERE", "JOINs", "Subqueries", "Window Functions", "CTEs", "Performance"]), resources: { website: "https://datacamp.com", youtube: "https://youtube.com" } },
    { topic: "Python for Data", duration: "WEEK 2", description: "Pandas & Data Manipulation.", subtopics: get6Subtopics(["Pandas", "NumPy", "Data Cleaning", "Matplotlib", "Seaborn", "Jupyter"]), resources: { website: "https://python.org", youtube: "https://youtube.com" } },
    { topic: "Data Visualization", duration: "WEEK 3", description: "Tableau/Power BI dashboards.", subtopics: get6Subtopics(["Tableau Basics", "Power Query", "DAX", "Calculated Fields", "Storytelling", "Filters"]), resources: { website: "https://tableau.com", youtube: "https://youtube.com" } },
    { topic: "Statistics", duration: "WEEK 4", description: "A/B Testing & Analysis.", subtopics: get6Subtopics(["Probability", "Hypothesis Tests", "Regression", "A/B Testing", "Distributions", "ANOVA"]), resources: { website: "https://statquest.org", youtube: "https://youtube.com" } }
  ],
  "WEB DEVELOPER": [
    { topic: "Frontend Fundamentals", duration: "WEEK 1", description: "HTML/CSS and accessibility.", subtopics: get6Subtopics(["Semantic HTML", "Flexbox/Grid", "Responsive Layout", "A11y", "CSS Variables", "Animations"]), resources: { website: "https://mdn.io", youtube: "https://youtube.com" } },
    { topic: "Advanced JS", duration: "WEEK 2", description: "ES6+, Async, DOM.", subtopics: get6Subtopics(["ES6 syntax", "Promises/Async", "DOM Manipulation", "Closures", "Fetch API", "Event Loop"]), resources: { website: "https://javascript.info", youtube: "https://youtube.com" } },
    { topic: "React.js", duration: "WEEK 3", description: "Modern UI engineering.", subtopics: get6Subtopics(["Components", "React Hooks", "State Management", "Router", "Context API", "UseEffect"]), resources: { website: "https://react.dev", youtube: "https://youtube.com" } },
    { topic: "Fullstack Basics", duration: "WEEK 4", description: "Node/Express and Deployments.", subtopics: get6Subtopics(["Node.js", "Express routing", "REST API", "MongoDB", "Vercel Deploy", "JWT Auth"]), resources: { website: "https://nodejs.org", youtube: "https://youtube.com" } }
  ],
  "SOFTWARE ENGINEER": [
    { topic: "Data Structures", duration: "WEEK 1", description: "Core algorithmic thinking.", subtopics: get6Subtopics(["Arrays/Hashing", "Two Pointers", "Linked Lists", "Trees", "Tries", "Graphs"]), resources: { website: "https://leetcode.com", youtube: "https://youtube.com" } },
    { topic: "System Design Fundamentals", duration: "WEEK 2", description: "Architecture at scale.", subtopics: get6Subtopics(["Load Balancing", "Caching", "Database Sharding", "Message Queues", "Microservices", "CAP Theorem"]), resources: { website: "https://systemdesignprimer.com", youtube: "https://youtube.com" } },
    { topic: "Backend Frameworks", duration: "WEEK 3", description: "Server-side logic and APIs.", subtopics: get6Subtopics(["Spring Boot / Django", "ORM Integration", "API Gateways", "Authentication", "Validation", "Rate Limiting"]), resources: { website: "https://spring.io", youtube: "https://youtube.com" } },
    { topic: "CI/CD & DevOps", duration: "WEEK 4", description: "Automated pipelines.", subtopics: get6Subtopics(["Git Workflow", "Docker Containers", "GitHub Actions", "Unit Testing", "Kubernetes", "AWS Basics"]), resources: { website: "https://docker.com", youtube: "https://youtube.com" } }
  ],
  "CHIEF AI OFFICER": [
    { topic: "AI Strategy", duration: "WEEK 1", description: "Enterprise AI adoption.", subtopics: get6Subtopics(["KPIs", "Make vs Buy", "Budgets", "Workflows", "Resource Allocation", "Board Reporting"]), resources: { website: "https://hbr.org", youtube: "https://youtube.com" } },
    { topic: "Data Governance", duration: "WEEK 2", description: "Securing data pipelines.", subtopics: get6Subtopics(["Compliance", "Data Lakes", "Security", "Lineage", "Access Control", "Data Quality"]), resources: { website: "https://aws.com", youtube: "https://youtube.com" } },
    { topic: "Leading AI Teams", duration: "WEEK 3", description: "MLOps and culture.", subtopics: get6Subtopics(["Hiring", "MLOps", "Agile AI", "Code Review", "Experiment Tracking", "Deployment"]), resources: { website: "https://ml-ops.org", youtube: "https://youtube.com" } },
    { topic: "AI Ethics", duration: "WEEK 4", description: "Responsible AI frameworks.", subtopics: get6Subtopics(["Bias Mitigation", "Explainability", "Auditing", "Compliance", "Red Teaming", "Legal Risks"]), resources: { website: "https://ethics.fast.ai", youtube: "https://youtube.com" } }
  ],
  "PRODUCT MANAGER": [
    { topic: "Product Discovery", duration: "WEEK 1", description: "Finding the right problems.", subtopics: get6Subtopics(["User Interviews", "Market Research", "Journey Maps", "Competitor Intel", "Personas", "Problem Framing"]), resources: { website: "https://svpg.com", youtube: "https://youtube.com" } },
    { topic: "Agile & Delivery", duration: "WEEK 2", description: "Shipping efficiently.", subtopics: get6Subtopics(["Scrum/Kanban", "Sprint Planning", "Jira Management", "Story Points", "Retrospectives", "Release Mapping"]), resources: { website: "https://atlassian.com", youtube: "https://youtube.com" } },
    { topic: "Product Analytics", duration: "WEEK 3", description: "Making data-driven decisions.", subtopics: get6Subtopics(["Mixpanel/Amplitude", "Retention Cohorts", "Funnel Analysis", "A/B Testing", "SQL Basics", "Defining Metrics"]), resources: { website: "https://amplitude.com", youtube: "https://youtube.com" } },
    { topic: "Roadmapping", duration: "WEEK 4", description: "Strategic alignments.", subtopics: get6Subtopics(["OKRs", "Prioritization Frameworks", "RICE Scoring", "Stakeholder Mgmt", "Executive Pitching", "GTM Strategy"]), resources: { website: "https://productschool.com", youtube: "https://youtube.com" } }
  ],
  "DEVOPS ENGINEER": [
    { topic: "Linux & Scripting", duration: "WEEK 1", description: "OS level automation.", subtopics: get6Subtopics(["Bash Scripting", "Cron Jobs", "SSH Tunnels", "Permissions", "Networking", "System Monitoring"]), resources: { website: "https://linux.org", youtube: "https://youtube.com" } },
    { topic: "Cloud Platforms (AWS)", duration: "WEEK 2", description: "Core cloud infrastructure.", subtopics: get6Subtopics(["EC2 Instances", "S3 Storage", "IAM Roles", "VPC/Subnets", "RDS Databases", "CloudWatch"]), resources: { website: "https://aws.amazon.com", youtube: "https://youtube.com" } },
    { topic: "Containers & Orchestration", duration: "WEEK 3", description: "Docker and Kubernetes.", subtopics: get6Subtopics(["Dockerfiles", "Docker Compose", "K8s Pods", "Deployments", "Services", "Helm Charts"]), resources: { website: "https://kubernetes.io", youtube: "https://youtube.com" } },
    { topic: "CI/CD & IaC", duration: "WEEK 4", description: "Automated provisioning rules.", subtopics: get6Subtopics(["Jenkins/Actions", "Terraform", "Ansible", "Pipeline YAML", "Blue/Green Deploy", "Secrets Management"]), resources: { website: "https://terraform.io", youtube: "https://youtube.com" } }
  ],
  "UX DESIGNER": [
    { topic: "UX Research Basics", duration: "WEEK 1", description: "Understanding the user.", subtopics: get6Subtopics(["User Interviews", "Usability Testing", "Card Sorting", "User Personas", "Empathy Maps", "Survey Design"]), resources: { website: "https://nngroup.com", youtube: "https://youtube.com" } },
    { topic: "Information Architecture", duration: "WEEK 2", description: "Structuring content.", subtopics: get6Subtopics(["Sitemaps", "Wireframing", "User Flows", "Navigation Patterns", "Content Strategy", "Task Analysis"]), resources: { website: "https://interaction-design.org", youtube: "https://youtube.com" } },
    { topic: "Prototyping in Figma", duration: "WEEK 3", description: "High-fidelity mockups.", subtopics: get6Subtopics(["Components", "Auto Layout", "Interactive Prototyping", "Design Systems", "Typography", "Color Theory"]), resources: { website: "https://figma.com", youtube: "https://youtube.com" } },
    { topic: "Handoff & Analytics", duration: "WEEK 4", description: "Post-design delivery.", subtopics: get6Subtopics(["Developer Handoff", "Design Specs", "A/B Test Design", "Heatmaps", "Accessibility (WCAG)", "Heuristic Eval"]), resources: { website: "https://awwwards.com", youtube: "https://youtube.com" } }
  ],
  "CLOUD ARCHITECT": [
    { topic: "Cloud Networking", duration: "WEEK 1", description: "Secure global topologies.", subtopics: get6Subtopics(["VPC Peering", "Transit Gateways", "Route 53", "Direct Connect", "CDN / CloudFront", "WAF setup"]), resources: { website: "https://aws.training", youtube: "https://youtube.com" } },
    { topic: "Compute & Serverless", duration: "WEEK 2", description: "Scaling architectures.", subtopics: get6Subtopics(["AWS Lambda", "Fargate", "Auto-scaling Groups", "EventBridge", "SQS/SNS", "Step Functions"]), resources: { website: "https://aws.amazon.com", youtube: "https://youtube.com" } },
    { topic: "Data Storage Strategy", duration: "WEEK 3", description: "Database and object storage.", subtopics: get6Subtopics(["Aurora DB", "DynamoDB NoSQL", "ElastiCache", "S3 Lifecycle", "Glacier", "Redshift"]), resources: { website: "https://aws.amazon.com", youtube: "https://youtube.com" } },
    { topic: "Security & Cost", duration: "WEEK 4", description: "Well-architected frameworks.", subtopics: get6Subtopics(["IAM Advanced", "KMS Encryption", "Shield", "Cost Explorer", "Reserved Instances", "GuardDuty"]), resources: { website: "https://aws.training", youtube: "https://youtube.com" } }
  ],
  "CYBERSECURITY ANALYST": [
    { topic: "Networking Fundamentals", duration: "WEEK 1", description: "Understanding TCP/IP.", subtopics: get6Subtopics(["OSI Model", "TCP/UDP", "Subnetting", "Wireshark", "DNS Poisoning", "Firewall Rules"]), resources: { website: "https://comptia.org", youtube: "https://youtube.com" } },
    { topic: "Threat Intelligence", duration: "WEEK 2", description: "Identifying adversaries.", subtopics: get6Subtopics(["MITRE ATT&CK", "Malware Analysis", "Phishing Trends", "OSINT", "Zero-day Exploits", "Dark Web Monitoring"]), resources: { website: "https://mitre.org", youtube: "https://youtube.com" } },
    { topic: "Incident Response", duration: "WEEK 3", description: "Handling active breaches.", subtopics: get6Subtopics(["SIEM (Splunk)", "Log Analysis", "Containment", "Eradication", "Digital Forensics", "Post-Incident Reports"]), resources: { website: "https://sans.org", youtube: "https://youtube.com" } },
    { topic: "Ethical Hacking Intro", duration: "WEEK 4", description: "Offensive security basics.", subtopics: get6Subtopics(["Nmap Scanning", "Metasploit", "OWASP Top 10", "SQL Injection", "XSS", "Burp Suite"]), resources: { website: "https://hackthebox.com", youtube: "https://youtube.com" } }
  ],
  "MACHINE LEARNING ENGINEER": [
    { topic: "Math & Algorithms", duration: "WEEK 1", description: "Core theoretical pillars.", subtopics: get6Subtopics(["Linear Algebra", "Calculus Gradients", "Probability", "SVMs", "Random Forests", "Gradient Boosting"]), resources: { website: "https://deeplearning.ai", youtube: "https://youtube.com" } },
    { topic: "Deep Learning Intro", duration: "WEEK 2", description: "Neural networks via PyTorch.", subtopics: get6Subtopics(["PyTorch Tensors", "Backpropagation", "CNNs", "RNNs/LSTMs", "Loss Functions", "Optimizers (Adam)"]), resources: { website: "https://pytorch.org", youtube: "https://youtube.com" } },
    { topic: "NLP & Transformers", duration: "WEEK 3", description: "Modern language models.", subtopics: get6Subtopics(["Word Embeddings", "Attention Mechanism", "HuggingFace", "BERT Fine-tuning", "LLM Prompting", "RAG Arch"]), resources: { website: "https://huggingface.co", youtube: "https://youtube.com" } },
    { topic: "Model Deployment", duration: "WEEK 4", description: "Serving models in production.", subtopics: get6Subtopics(["FastAPI Serving", "ONNX RunTime", "Dockerizing ML", "Triton Server", "Model Registry", "A/B Testing MLOps"]), resources: { website: "https://mlflow.org", youtube: "https://youtube.com" } }
  ]
};

// Add remaining 20 roles dynamically extending the same deep generic matrix to avoid extreme file size limits
const advancedRoles = [
  "MOBILE DEVELOPER", "GAME DEVELOPER", "BLOCKCHAIN ENGINEER", "DATA ENGINEER", "QA TESTER",
  "SYSTEM ADMINISTRATOR", "DATABASE ADMINISTRATOR", "FRONTEND DEVELOPER", "BACKEND DEVELOPER", "FULLSTACK ENGINEER",
  "AI RESEARCHER", "NLP ENGINEER", "COMPUTER VISION ENGINEER", "ROBOTICS ENGINEER", "SRE ENGINEER",
  "IT SUPPORT SPECIALIST", "NETWORK ENGINEER", "SECURITY RESEARCHER", "PENETRATION TESTER", "IT MANAGER"
];

advancedRoles.forEach(r => {
  roleRoadmaps[r] = [
    { topic: `${r} Core Concepts`, duration: "WEEK 1", description: `Foundational pillars for ${r}.`, subtopics: get6Subtopics(["Fundamentals", "Architecture", "Environment Setup", "Best Practices", "Core Tooling", "Syntax"]), resources: { website: "https://coursera.org", youtube: "https://youtube.com" } },
    { topic: `Advanced ${r} Tools`, duration: "WEEK 2", description: "Mastering practical tools.", subtopics: get6Subtopics(["CLI Tools", "Frameworks", "Debugging", "Optimization", "Testing", "Deployment CLI"]), resources: { website: "https://udemy.com", youtube: "https://youtube.com" } },
    { topic: `System Integration`, duration: "WEEK 3", description: "Connecting environments.", subtopics: get6Subtopics(["APIs", "Database Links", "Cloud Hooks", "Security Audits", "Microservices", "Data Pipelines"]), resources: { website: "https://pluralsight.com", youtube: "https://youtube.com" } },
    { topic: `Production Deployment`, duration: "WEEK 4", description: "Shipping real projects.", subtopics: get6Subtopics(["CI/CD", "Monitoring", "Scaling Strategies", "Load Balancing", "Docker", "Agile Sprints"]), resources: { website: "https://github.com", youtube: "https://youtube.com" } }
  ];
});
