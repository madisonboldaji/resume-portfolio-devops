# Create a resource group to hold my Azure resources
resource "azurerm_resource_group" "resume_rg" {
    name     =var.resource_group_name  # Use variable from variables.tf file
    location =var.location             # Use variable from variables.tf file
}

# Create a Static Web App (Free Tier)
resource "azurerm_static_web_app" "resume_site" {
    name                =var.static_site_name  # Use variable from variables.tf file
    location            =var.location           # Use variable from variables.tf file
    resource_group_name = azurerm_resource_group.resume_rg.name  # Reference the resource group created above
    sku_tier            = "Free"  # Use the Free tier for the Static Web App
}

