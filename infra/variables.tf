# Name of the resource group 
variable "resource_group_name" {
    type        = string 
    description = "Name of the Azure resource group." 
    default     = "resume-rg"
}

# Location/region for deployment
variable "location" {
    type        = string 
    description = "Azure region to deploy resources."   
    default     = "eastus2"  # Default to East US region
}

# Name of the Static Web App
variable "static_site_name" {
    type        = string 
    description = "Name of the Azure Static Web App." 
    default     = "madison-resume-site"  # Default name for the static site
}