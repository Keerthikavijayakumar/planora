const buildPrompt = (domain, skillLevel, teamSize, purpose) => {
    const isFresher = skillLevel.toLowerCase() === 'fresher' || skillLevel.toLowerCase() === 'beginner';

    let domainConstraints = "";
    switch (domain.toLowerCase()) {
        case 'ai/ml':
        case 'artificial intelligence':
            domainConstraints = "Must include model training workflow, dataset sources, evaluation metrics (accuracy/f1), and deployment (Flask/FastAPI).";
            break;
        case 'web development':
            domainConstraints = "Must include frontend-backend separation, RESTful API design, database schema, and authentication.";
            break;
        case 'mobile development':
            domainConstraints = "Must specify native (Swift/Kotlin) or cross-platform (Flutter/React Native), offline storage, and app store deployment.";
            break;
        case 'cybersecurity':
            domainConstraints = "Must include encryption standards, penetration testing phases, and security compliance (OWASP).";
            break;
        case 'blockchain':
            domainConstraints = "Must include smart contract details (Solidify/Rust), wallet integration, and consensus mechanism usage.";
            break;
        case 'devops':
            domainConstraints = "Must focus on CI/CD pipelines (Jenkins/GitHub Actions), containerization (Docker), and orchestration (K8s).";
            break;
        case 'data science':
            domainConstraints = "Must include data cleaning, visualization (Streamlit/Dash), and insight generation.";
            break;
        default:
            domainConstraints = "Focus on software engineering best practices, modular architecture, and scalability.";
    }

    let skillInstructions = "";
    if (skillLevel.toLowerCase() === 'fresher') {
        skillInstructions = `
    - TARGET USERS: Absolute beginners.
    - TECH STACK: FORCE simplest stack (HTML/JS/CSS + Node/Express or Simple Python script).
    - EXPLANATION: Explain WHY this stack is chosen (e.g., "Easy to debug", "No compile time").
    - EDUCATION MODE: MUST include "educational_mode" field with learning path.
    `;
    } else if (skillLevel.toLowerCase() === 'intermediate') {
        skillInstructions = `
    - TECH STACK: MERN (Mongo, Express, React, Node) or PERN (Postgres).
    - ARCHITECTURE: MVC Pattern.
    - FOCUS: Auth, API integration, State Management.
    `;
    } else if (skillLevel.toLowerCase() === 'advanced') {
        skillInstructions = `
    - TECH STACK: Next.js, TypeScript, Go/Rust, Docker.
    - ARCHITECTURE: Microservices or Serverless.
    - FOCUS: Scalability, Performance, Security.
    `;
    }

    return `
    Act as a Senior AI Software Architect.
    Generate a STRUCTURED, DOMAIN-SPECIFIC software project idea for a Computer Science student.

    CONTEXT:
    - Domain: ${domain}
    - Skill Level: ${skillLevel}
    - Team/Solo: ${teamSize}
    - Goal/Purpose: ${purpose}

    CONSTRAINTS & RULES:
    1. **Domain Logic**: ${domainConstraints}
    2. **Skill Customization**: ${skillInstructions}
    3. **Differentiation**: You MUST list existing solutions and HOW this idea is new/different.
    4. **Scoring**:
       - Market Potential (0-10): Based on real-world demand.
       - Difficulty (0-10): Based on technical complexity.
       - Resume Impact (0-10): How much recruiters value this.

    OUTPUT FORMAT (Strict JSON, no markdown code blocks, just raw JSON):
    {
      "title": "String",
      "problem_statement": "String",
      "why_matters": "String",
      "target_users": "String",
      "core_features": {
        "must_have": ["String", "String"],
        "should_have": ["String"],
        "future_scope": ["String"]
      },
      "recommended_tech_stack": {
        "frontend": "String",
        "backend": "String",
        "database": "String",
        "deployment": "String",
        "reasoning": "String"
      },
      "roadmap_4_weeks": {
        "week1": "String",
        "week2": "String",
        "week3": "String",
        "week4": "String"
      },
      "existing_solutions": "String (List names)",
      "what_is_new": "String (Differentiation)",
      "market_potential_score": 0,
      "difficulty_score": 0,
      "resume_impact_score": 0,
      "educational_resources": ${isFresher ? '{"learning_path": "String", "key_concepts": ["String"]}' : 'null'},
      "monetization": "String"
    }
  `;
};

module.exports = { buildPrompt };
