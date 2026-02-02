// Traveease Azure Infrastructure - Bicep Template
// Purpose: Define Azure resources using Bicep language (more readable than JSON ARM)
// Usage: az deployment group create --resource-group <rg> --template-file traveease-infrastructure.bicep

param location string = resourceGroup().location
param environment string = 'production'
param clusterName string = 'traveease-${environment}'
param vmSize string = 'Standard_D2s_v3'
param nodeCount int = 3
param kubernetesVersion string = '1.27'
param dbSku string = 'Standard_B2s'
param dbStorage int = 128
param acrSku string = 'Premium'
param enableMonitoring bool = true

// Variables
var vnetName = '${clusterName}-vnet'
var vnetAddressSpace = '10.0.0.0/8'
var aksSnet = '10.1.0.0/16'
var appGatewaySubnet = '10.2.0.0/24'
var dbSubnet = '10.3.0.0/24'
var nsgName = '${clusterName}-nsg'
var aksManagedIdentity = '${clusterName}-mi'
var dbServerName = '${clusterName}-mysql'
var storageAccountName = 'traveease${environment}${uniqueString(resourceGroup().id)}'
var acrName = 'traveease${environment}${uniqueString(resourceGroup().id)}'
var keyVaultName = '${clusterName}-kv'
var logAnalyticsName = '${clusterName}-la'
var appInsightsName = '${clusterName}-ai'
var tags = {
  environment: environment
  project: 'traveease'
  managedBy: 'terraform'
  createdDate: utcNow('u')
}

// Network Security Group
resource nsg 'Microsoft.Network/networkSecurityGroups@2021-02-01' = {
  name: nsgName
  location: location
  tags: tags
  properties: {
    securityRules: [
      {
        name: 'AllowHTTP'
        properties: {
          protocol: 'Tcp'
          sourcePortRange: '*'
          destinationPortRange: '80'
          sourceAddressPrefix: '*'
          destinationAddressPrefix: '*'
          access: 'Allow'
          priority: 1000
          direction: 'Inbound'
        }
      }
      {
        name: 'AllowHTTPS'
        properties: {
          protocol: 'Tcp'
          sourcePortRange: '*'
          destinationPortRange: '443'
          sourceAddressPrefix: '*'
          destinationAddressPrefix: '*'
          access: 'Allow'
          priority: 1001
          direction: 'Inbound'
        }
      }
      {
        name: 'AllowAKS'
        properties: {
          protocol: 'Tcp'
          sourcePortRange: '*'
          destinationPortRange: '9000'
          sourceAddressPrefix: '*'
          destinationAddressPrefix: '*'
          access: 'Allow'
          priority: 1002
          direction: 'Inbound'
        }
      }
      {
        name: 'DenyAllInbound'
        properties: {
          protocol: '*'
          sourcePortRange: '*'
          destinationPortRange: '*'
          sourceAddressPrefix: '*'
          destinationAddressPrefix: '*'
          access: 'Deny'
          priority: 4096
          direction: 'Inbound'
        }
      }
    ]
  }
}

// Virtual Network
resource vnet 'Microsoft.Network/virtualNetworks@2021-02-01' = {
  name: vnetName
  location: location
  tags: tags
  properties: {
    addressSpace: {
      addressPrefixes: [
        vnetAddressSpace
      ]
    }
    subnets: [
      {
        name: 'aks-subnet'
        properties: {
          addressPrefix: aksSnet
          networkSecurityGroup: {
            id: nsg.id
          }
          serviceEndpoints: [
            {
              service: 'Microsoft.Storage'
            }
            {
              service: 'Microsoft.KeyVault'
            }
            {
              service: 'Microsoft.Sql'
            }
          ]
        }
      }
      {
        name: 'appgateway-subnet'
        properties: {
          addressPrefix: appGatewaySubnet
          networkSecurityGroup: {
            id: nsg.id
          }
        }
      }
      {
        name: 'db-subnet'
        properties: {
          addressPrefix: dbSubnet
          networkSecurityGroup: {
            id: nsg.id
          }
          serviceEndpoints: [
            {
              service: 'Microsoft.Sql'
            }
          ]
        }
      }
    ]
  }
}

// Managed Identity for AKS
resource aksMI 'Microsoft.ManagedIdentity/userAssignedIdentities@2018-11-30' = {
  name: aksManagedIdentity
  location: location
  tags: tags
}

// Role Assignment for AKS
resource acrPullRole 'Microsoft.Authorization/roleAssignments@2021-04-01-preview' = {
  scope: acr
  name: guid(resourceGroup().id, aksMI.id, 'AcrPull')
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '7f951dda-4ed3-4680-a7ca-6e2d8e0cef8e')
    principalId: aksMI.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

// AKS Cluster
resource aksCluster 'Microsoft.ContainerService/managedClusters@2022-06-01' = {
  name: clusterName
  location: location
  tags: tags
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${aksMI.id}': {}
    }
  }
  properties: {
    dnsPrefix: clusterName
    kubernetesVersion: kubernetesVersion
    enableRBAC: true
    networkProfile: {
      networkPlugin: 'azure'
      serviceCidr: '10.100.0.0/16'
      dnsServiceIP: '10.100.0.10'
      dockerBridgeCidr: '172.17.0.1/16'
      networkPolicy: 'azure'
    }
    addonProfiles: enableMonitoring ? {
      omsagent: {
        enabled: true
        config: {
          logAnalyticsWorkspaceResourceID: logAnalytics.id
        }
      }
    } : {}
    agentPoolProfiles: [
      {
        name: 'agentpool'
        count: nodeCount
        vmSize: vmSize
        osType: 'Linux'
        type: 'VirtualMachineScaleSets'
        enableAutoScaling: true
        minCount: 3
        maxCount: 10
        vnetSubnetID: '${vnet.id}/subnets/aks-subnet'
        orchestratorVersion: kubernetesVersion
        mode: 'System'
        osSKU: 'Ubuntu'
      }
    ]
    servicePrincipalProfile: {
      clientId: 'msi'
    }
  }
  dependsOn: [
    nsg
    vnet
    aksMI
  ]
}

// Azure Database for MySQL
resource mySQLServer 'Microsoft.DBforMySQL/flexibleServers@2021-12-01-preview' = {
  name: dbServerName
  location: location
  tags: tags
  sku: {
    name: dbSku
    tier: 'Burstable'
  }
  properties: {
    administratorLogin: 'sqladmin'
    administratorLoginPassword: uniqueString(resourceGroup().id, deployment().name)
    version: '8.0'
    storage: {
      storageSizeGB: dbStorage
    }
    backup: {
      backupRetentionDays: 30
      geoRedundantBackup: 'Enabled'
    }
    highAvailability: {
      mode: 'ZoneRedundant'
    }
    network: {
      delegatedSubnetResourceId: '${vnet.id}/subnets/db-subnet'
      privateDnsZoneResourceId: ''
    }
    ssl: {
      enforcedSSL: 'REQUIRE'
      certificationAuthority: 'DigiCertGlobalRootCA'
    }
  }
  dependsOn: [
    vnet
  ]
}

// MySQL Databases
resource productionDb 'Microsoft.DBforMySQL/flexibleServers/databases@2021-12-01-preview' = {
  parent: mySQLServer
  name: 'traveease_production'
  properties: {
    charset: 'utf8mb4'
    collation: 'utf8mb4_general_ci'
  }
}

resource auditDb 'Microsoft.DBforMySQL/flexibleServers/databases@2021-12-01-preview' = {
  parent: mySQLServer
  name: 'traveease_audit'
  properties: {
    charset: 'utf8mb4'
    collation: 'utf8mb4_general_ci'
  }
}

// Storage Account
resource storageAccount 'Microsoft.Storage/storageAccounts@2021-04-01' = {
  name: storageAccountName
  location: location
  tags: tags
  sku: {
    name: 'Standard_RAGRS'
  }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
    allowBlobPublicAccess: false
    networkAcls: {
      bypass: 'AzureServices'
      defaultAction: 'Deny'
      virtualNetworkRules: [
        {
          id: '${vnet.id}/subnets/aks-subnet'
          action: 'Allow'
        }
      ]
    }
  }
}

// Container Registry
resource acr 'Microsoft.ContainerRegistry/registries@2021-09-01' = {
  name: acrName
  location: location
  tags: tags
  sku: {
    name: acrSku
  }
  properties: {
    adminUserEnabled: true
    publicNetworkAccess: 'Enabled'
    networkRuleBypassOptions: 'AzureServices'
    policies: {
      quarantinePolicy: {
        status: 'enabled'
      }
      retentionPolicy: {
        days: 30
        status: 'enabled'
      }
      trustPolicy: {
        type: 'Notary'
        status: 'disabled'
      }
    }
  }
}

// Key Vault
resource keyVault 'Microsoft.KeyVault/vaults@2021-10-01' = {
  name: keyVaultName
  location: location
  tags: tags
  properties: {
    enabledForDeployment: true
    enabledForDiskEncryption: false
    enabledForTemplateDeployment: true
    enableRbacAuthorization: false
    tenantId: subscription().tenantId
    sku: {
      family: 'A'
      name: 'standard'
    }
    accessPolicies: [
      {
        tenantId: subscription().tenantId
        objectId: aksMI.properties.principalId
        permissions: {
          keys: [
            'get'
          ]
          secrets: [
            'get'
            'list'
          ]
          certificates: []
        }
      }
    ]
    softDeleteRetentionInDays: 90
    enablePurgeProtection: true
  }
}

// Log Analytics Workspace
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2021-12-01-preview' = {
  name: logAnalyticsName
  location: location
  tags: tags
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

// Application Insights
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  tags: tags
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
    IngestionMode: 'LogAnalytics'
  }
}

// Outputs
output aksClusterId string = aksCluster.id
output aksFqdn string = aksCluster.properties.fqdn
output acrLoginServer string = acr.properties.loginServer
output keyVaultId string = keyVault.id
output storageAccountId string = storageAccount.id
output logAnalyticsId string = logAnalytics.id
output appInsightsId string = appInsights.id
output mySQLServerId string = mySQLServer.id
output mySQLServerFqdn string = mySQLServer.properties.fullyQualifiedDomainName
