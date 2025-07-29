# This block tells Terraform that I'm using Azure as the cloud provider
terraform {
    required_providers {
        azurerm = {
            source = "hashicorp/azurerm"  # Use the official Azure provider
            version = "~> 3.0"  # Specify the version of the Azure provider - use version 3.x
        }
    }

    required_version = ">= 1.5.0"  # Ensure Terraform version is at least 1.5.0
}

# Initialize the Azure provider
provider "azurerm" {
    features {}    # Enable all features of the Azure provider
}