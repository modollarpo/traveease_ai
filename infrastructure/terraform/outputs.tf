# Traveease Terraform Outputs

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "vpc_cidr" {
  description = "VPC CIDR block"
  value       = aws_vpc.main.cidr_block
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = aws_subnet.private[*].id
}

output "internet_gateway_id" {
  description = "Internet Gateway ID"
  value       = aws_internet_gateway.main.id
}

output "nat_gateway_ips" {
  description = "NAT Gateway Elastic IPs"
  value       = aws_eip.nat[*].public_ip
}

# ==========================================
# Security Groups
# ==========================================

output "alb_security_group_id" {
  description = "ALB security group ID"
  value       = aws_security_group.alb.id
}

output "ecs_security_group_id" {
  description = "ECS security group ID"
  value       = aws_security_group.ecs.id
}

output "rds_security_group_id" {
  description = "RDS security group ID"
  value       = aws_security_group.rds.id
}

# ==========================================
# RDS Database
# ==========================================

output "rds_cluster_id" {
  description = "RDS cluster identifier"
  value       = aws_rds_cluster.main.cluster_identifier
}

output "rds_cluster_endpoint" {
  description = "RDS cluster endpoint for write operations"
  value       = aws_rds_cluster.main.endpoint
  sensitive   = true
}

output "rds_reader_endpoint" {
  description = "RDS cluster reader endpoint"
  value       = aws_rds_cluster.main.reader_endpoint
  sensitive   = true
}

output "rds_database_name" {
  description = "RDS database name"
  value       = aws_rds_cluster.main.database_name
}

output "rds_master_username" {
  description = "RDS master username"
  value       = aws_rds_cluster.main.master_username
  sensitive   = false
}

output "rds_connection_string" {
  description = "RDS connection string for application setup"
  value       = "mysql://${aws_rds_cluster.main.master_username}:PASSWORD@${aws_rds_cluster.main.endpoint}:3306/${aws_rds_cluster.main.database_name}"
  sensitive   = true
}

output "rds_kms_key_id" {
  description = "KMS key ID for RDS encryption"
  value       = aws_kms_key.rds.key_id
}

# ==========================================
# Application Load Balancer
# ==========================================

output "alb_arn" {
  description = "ALB ARN"
  value       = aws_lb.main.arn
}

output "alb_dns_name" {
  description = "ALB DNS name"
  value       = aws_lb.main.dns_name
}

output "alb_zone_id" {
  description = "ALB hosted zone ID for Route53"
  value       = aws_lb.main.zone_id
}

output "http_listener_arn" {
  description = "HTTP listener ARN"
  value       = aws_lb_listener.http.arn
}

output "https_listener_arn" {
  description = "HTTPS listener ARN"
  value       = aws_lb_listener.https.arn
}

output "backend_target_group_arn" {
  description = "Backend target group ARN"
  value       = aws_lb_target_group.backend.arn
}

output "backend_target_group_name" {
  description = "Backend target group name"
  value       = aws_lb_target_group.backend.name
}

output "commerce_target_group_arn" {
  description = "Commerce target group ARN"
  value       = aws_lb_target_group.commerce.arn
}

output "commerce_target_group_name" {
  description = "Commerce target group name"
  value       = aws_lb_target_group.commerce.name
}

output "frontend_target_group_arn" {
  description = "Frontend target group ARN"
  value       = aws_lb_target_group.frontend.arn
}

output "frontend_target_group_name" {
  description = "Frontend target group name"
  value       = aws_lb_target_group.frontend.name
}

# ==========================================
# ECS Cluster
# ==========================================

output "ecs_cluster_id" {
  description = "ECS cluster ID"
  value       = aws_ecs_cluster.main.id
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}

output "ecs_cluster_arn" {
  description = "ECS cluster ARN"
  value       = aws_ecs_cluster.main.arn
}

# ==========================================
# CloudWatch Log Groups
# ==========================================

output "ecs_backend_log_group_name" {
  description = "Backend ECS CloudWatch log group"
  value       = aws_cloudwatch_log_group.ecs_backend.name
}

output "ecs_commerce_log_group_name" {
  description = "Commerce ECS CloudWatch log group"
  value       = aws_cloudwatch_log_group.ecs_commerce.name
}

output "ecs_frontend_log_group_name" {
  description = "Frontend ECS CloudWatch log group"
  value       = aws_cloudwatch_log_group.ecs_frontend.name
}

# ==========================================
# IAM Roles
# ==========================================

output "ecs_task_execution_role_arn" {
  description = "ECS task execution role ARN"
  value       = aws_iam_role.ecs_task_execution_role.arn
}

output "ecs_task_role_arn" {
  description = "ECS task role ARN"
  value       = aws_iam_role.ecs_task_role.arn
}

output "rds_monitoring_role_arn" {
  description = "RDS monitoring role ARN"
  value       = aws_iam_role.rds_monitoring.arn
}

# ==========================================
# Connection URLs
# ==========================================

output "application_url" {
  description = "Application URL via ALB"
  value       = "http://${aws_lb.main.dns_name}"
}

output "api_endpoint" {
  description = "API endpoint"
  value       = "http://${aws_lb.main.dns_name}/api"
}

output "commerce_endpoint" {
  description = "Commerce/payments endpoint"
  value       = "http://${aws_lb.main.dns_name}/payments"
}

# ==========================================
# Deployment Instructions
# ==========================================

output "deployment_instructions" {
  description = "Instructions for completing the deployment"
  value       = <<-EOT
    Next steps to complete deployment:
    
    1. Configure Route53 DNS:
       - Create CNAME record pointing to: ${aws_lb.main.dns_name}
       
    2. Install and configure ECS services:
       - Push Docker images to ECR
       - Register task definitions
       - Create ECS services
       
    3. Verify health:
       - Backend: http://${aws_lb.main.dns_name}/api/health
       - Commerce: http://${aws_lb.main.dns_name}/payments/health
       - Frontend: http://${aws_lb.main.dns_name}/
       
    4. Configure monitoring:
       - View logs: aws logs tail ${aws_cloudwatch_log_group.ecs_backend.name} --follow
       - View metrics: aws cloudwatch get-metric-statistics ...
       
    5. Set up auto-scaling:
       - Define scaling policies for ECS services
       - Configure CloudWatch alarms
       
    RDS Connection:
    - Endpoint: ${aws_rds_cluster.main.endpoint}
    - Database: ${aws_rds_cluster.main.database_name}
    - Username: ${aws_rds_cluster.main.master_username}
  EOT
}
