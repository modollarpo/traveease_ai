terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  cloud {
    organization = "your-org-name"  # Change to your Terraform Cloud org
    
    # Uncomment to use Terraform Cloud
    # hostname = "app.terraform.io"
    
    # workspaces {
    #   name = "traveease-production"
    # }
  }
}

provider "aws" {
  region = var.aws_region
}
