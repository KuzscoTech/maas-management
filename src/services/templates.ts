import type { Environment } from '../types/api';

export interface EnvironmentTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'development' | 'production' | 'research' | 'enterprise';
  tags: string[];
  config: Omit<Environment, 'id' | 'created_at' | 'updated_at' | 'status' | 'organization_id'>;
  agentConfigurations?: {
    agentType: string;
    config: Record<string, any>;
    autoStart?: boolean;
  }[];
}

export const environmentTemplates: EnvironmentTemplate[] = [
  {
    id: 'quick-start',
    name: 'Quick Start',
    description: 'Perfect for getting started quickly with basic AI agent functionality',
    icon: '⚡',
    category: 'development',
    tags: ['beginner', 'simple', 'fast-setup'],
    config: {
      name: 'Quick Start Environment',
      description: 'A simple environment to get started with AI agents',
      config: {
        security_level: 'development',
        auto_scaling: false,
        debug_mode: true,
        max_concurrent_tasks: 3,
        timeout_seconds: 300,
        retention_days: 7
      }
    },
    agentConfigurations: [
      {
        agentType: 'code_generator',
        config: {
          default_language: 'python',
          style_guide: 'pep8',
          include_tests: true
        },
        autoStart: true
      }
    ]
  },
  {
    id: 'development',
    name: 'Development Environment',
    description: 'Optimized for development work with debugging and testing capabilities',
    icon: '🛠️',
    category: 'development',
    tags: ['development', 'debugging', 'testing'],
    config: {
      name: 'Development Environment',
      description: 'A development environment for testing AI agents and workflows',
      config: {
        security_level: 'development',
        auto_scaling: false,
        debug_mode: true,
        max_concurrent_tasks: 5,
        timeout_seconds: 600,
        retention_days: 30,
        enable_logging: true,
        log_level: 'debug'
      }
    },
    agentConfigurations: [
      {
        agentType: 'code_generator',
        config: {
          default_language: 'python',
          style_guide: 'pep8',
          include_tests: true,
          include_documentation: true
        }
      },
      {
        agentType: 'testing_agent',
        config: {
          default_framework: 'pytest',
          coverage_threshold: 80,
          include_integration_tests: true
        }
      }
    ]
  },
  {
    id: 'production',
    name: 'Production Environment',
    description: 'High-security, high-performance environment for production workloads',
    icon: '🚀',
    category: 'production',
    tags: ['production', 'secure', 'scalable', 'monitoring'],
    config: {
      name: 'Production Environment',
      description: 'A production-ready environment with high security and performance',
      config: {
        security_level: 'production',
        auto_scaling: true,
        debug_mode: false,
        max_concurrent_tasks: 20,
        timeout_seconds: 1800,
        retention_days: 90,
        enable_logging: true,
        log_level: 'info',
        enable_monitoring: true,
        health_check_interval: 30
      }
    },
    agentConfigurations: [
      {
        agentType: 'code_generator',
        config: {
          default_language: 'python',
          style_guide: 'production',
          include_tests: true,
          include_documentation: true,
          security_scan: true
        },
        autoStart: true
      },
      {
        agentType: 'testing_agent',
        config: {
          default_framework: 'pytest',
          coverage_threshold: 95,
          include_integration_tests: true,
          include_performance_tests: true
        },
        autoStart: true
      },
      {
        agentType: 'github_integration',
        config: {
          auto_create_pr: true,
          require_reviews: true,
          branch_protection: true
        }
      }
    ]
  },
  {
    id: 'research',
    name: 'Research Laboratory',
    description: 'Optimized for AI research and experimentation with flexible configurations',
    icon: '🔬',
    category: 'research',
    tags: ['research', 'experimentation', 'flexible', 'analytics'],
    config: {
      name: 'Research Environment',
      description: 'A research environment for AI agent experimentation and analysis',
      config: {
        security_level: 'research',
        auto_scaling: true,
        debug_mode: true,
        max_concurrent_tasks: 10,
        timeout_seconds: 3600,
        retention_days: 180,
        enable_logging: true,
        log_level: 'debug',
        enable_analytics: true,
        experiment_tracking: true
      }
    },
    agentConfigurations: [
      {
        agentType: 'research_agent',
        config: {
          search_depth: 'comprehensive',
          fact_checking: true,
          citation_style: 'academic',
          include_methodology: true
        },
        autoStart: true
      },
      {
        agentType: 'code_generator',
        config: {
          default_language: 'python',
          include_notebooks: true,
          data_analysis_focus: true,
          visualization_libraries: ['matplotlib', 'seaborn', 'plotly']
        }
      }
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise Suite',
    description: 'Complete enterprise solution with compliance, governance, and advanced features',
    icon: '🏢',
    category: 'enterprise',
    tags: ['enterprise', 'compliance', 'governance', 'audit'],
    config: {
      name: 'Enterprise Environment',
      description: 'An enterprise-grade environment with compliance and governance features',
      config: {
        security_level: 'enterprise',
        auto_scaling: true,
        debug_mode: false,
        max_concurrent_tasks: 50,
        timeout_seconds: 3600,
        retention_days: 365,
        enable_logging: true,
        log_level: 'info',
        enable_monitoring: true,
        enable_audit: true,
        compliance_mode: true,
        data_encryption: true
      }
    },
    agentConfigurations: [
      {
        agentType: 'code_generator',
        config: {
          security_scan: true,
          compliance_check: true,
          code_review_required: true,
          documentation_required: true
        },
        autoStart: true
      },
      {
        agentType: 'testing_agent',
        config: {
          coverage_threshold: 95,
          security_testing: true,
          performance_testing: true,
          compliance_testing: true
        },
        autoStart: true
      },
      {
        agentType: 'github_integration',
        config: {
          auto_create_pr: true,
          require_reviews: true,
          branch_protection: true,
          compliance_checks: true
        },
        autoStart: true
      },
      {
        agentType: 'research_agent',
        config: {
          fact_checking: true,
          citation_required: true,
          audit_trail: true
        }
      }
    ]
  },
  {
    id: 'ml-pipeline',
    name: 'ML Pipeline',
    description: 'Specialized environment for machine learning workflows and model development',
    icon: '🤖',
    category: 'research',
    tags: ['machine-learning', 'pipeline', 'models', 'training'],
    config: {
      name: 'ML Pipeline Environment',
      description: 'An environment optimized for machine learning workflows and model development',
      config: {
        security_level: 'research',
        auto_scaling: true,
        debug_mode: true,
        max_concurrent_tasks: 15,
        timeout_seconds: 7200,
        retention_days: 90,
        enable_logging: true,
        log_level: 'info',
        gpu_support: true,
        model_versioning: true
      }
    },
    agentConfigurations: [
      {
        agentType: 'code_generator',
        config: {
          default_language: 'python',
          ml_libraries: ['scikit-learn', 'tensorflow', 'pytorch', 'pandas'],
          include_data_validation: true,
          model_documentation: true
        },
        autoStart: true
      },
      {
        agentType: 'testing_agent',
        config: {
          data_quality_tests: true,
          model_performance_tests: true,
          regression_tests: true
        },
        autoStart: true
      }
    ]
  }
];

export const getTemplatesByCategory = (category?: string) => {
  if (!category) return environmentTemplates;
  return environmentTemplates.filter(template => template.category === category);
};

export const getTemplateById = (id: string) => {
  return environmentTemplates.find(template => template.id === id);
};

export const getTemplatesByTags = (tags: string[]) => {
  return environmentTemplates.filter(template =>
    tags.some(tag => template.tags.includes(tag))
  );
};

export const searchTemplates = (query: string) => {
  const lowerQuery = query.toLowerCase();
  return environmentTemplates.filter(template =>
    template.name.toLowerCase().includes(lowerQuery) ||
    template.description.toLowerCase().includes(lowerQuery) ||
    template.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};