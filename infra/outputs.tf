# Print the Static Web App URL after deployment
output "static_site_url" {
    value       = azurerm_static_web_app.resume_site.default_host_name  # Output the default host name of the Static Web App
    description = "The URL of the deployed Static Web App"  # Description of the output variable
}