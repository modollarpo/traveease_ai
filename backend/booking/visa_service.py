"""
Visa Processing Service
Handles visa eligibility checks, document verification, visa applications, and status tracking.
Integrates with immigration APIs and compliance verification.
"""

from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum
import logging
import hashlib

from circuit_breaker import CircuitBreaker

logger = logging.getLogger(__name__)


class VisaStatus(Enum):
    """Visa application status"""
    APPLICATION_INITIATED = "APPLICATION_INITIATED"
    ELIGIBILITY_CHECKED = "ELIGIBILITY_CHECKED"
    DOCUMENTS_SUBMITTED = "DOCUMENTS_SUBMITTED"
    DOCUMENTS_VERIFIED = "DOCUMENTS_VERIFIED"
    PAYMENT_PROCESSED = "PAYMENT_PROCESSED"
    UNDER_REVIEW = "UNDER_REVIEW"
    VISA_APPROVED = "VISA_APPROVED"
    VISA_REJECTED = "VISA_REJECTED"
    VISA_CANCELLED = "VISA_CANCELLED"
    VISA_EXPIRED = "VISA_EXPIRED"


@dataclass
class VisaEligibility:
    """Visa eligibility assessment"""
    citizen_country: str
    destination_country: str
    eligible: bool
    visa_type: str
    processing_time_days: int
    visa_fee: float
    currency: str
    requirements: List[str]
    exemptions: List[str]


@dataclass
class VisaApplication:
    """Visa application record"""
    application_id: str
    applicant_name: str
    applicant_passport: str  # Masked
    citizen_country: str
    destination_country: str
    visa_type: str
    status: str
    application_date: str
    estimated_completion_date: str
    visa_fee: float
    processing_fee: float
    currency: str
    reference_number: str
    documents_submitted: List[str]
    created_at: str


class VisaService:
    """Service for visa processing and application management"""
    
    def __init__(self, config: Any):
        """
        Initialize VisaService
        Args:
            config: Configuration object with API credentials
        """
        self.config = config
        self.circuit_breaker = CircuitBreaker(failure_threshold=5, timeout=60)
        self.applications: Dict[str, Dict] = {}
        self.approved_visas: Dict[str, Dict] = {}
        logger.info("VisaService initialized")
    
    def visa_eligibility_check(
        self,
        citizen_country: str,
        destination_country: str,
        passport_number: Optional[str] = None
    ) -> VisaEligibility:
        """
        Check visa eligibility for a citizen traveling to a destination
        Args:
            citizen_country: Passport country (ISO 3166-1 alpha-2)
            destination_country: Destination country (ISO 3166-1 alpha-2)
            passport_number: Passport number (optional, for additional checks)
        Returns:
            VisaEligibility object with requirements
        """
        try:
            if not self.circuit_breaker.is_available():
                logger.warning(f"Circuit breaker OPEN for eligibility check {citizen_country}->{destination_country}")
                return VisaEligibility(
                    citizen_country=citizen_country,
                    destination_country=destination_country,
                    eligible=False,
                    visa_type="UNKNOWN",
                    processing_time_days=0,
                    visa_fee=0,
                    currency="USD",
                    requirements=[],
                    exemptions=[]
                )
            
            logger.info(f"Checking visa eligibility: {citizen_country} -> {destination_country}")
            
            # In production: Check real visa database (e.g., IND database, Timatic)
            eligibility = self._mock_visa_eligibility(citizen_country, destination_country)
            
            self.circuit_breaker.record_success()
            return eligibility
            
        except Exception as e:
            self.circuit_breaker.record_failure()
            logger.error(f"Eligibility check failed: {str(e)}")
            raise
    
    def document_verification(
        self,
        application_id: str,
        documents: Dict[str, str]
    ) -> Dict[str, Any]:
        """
        Verify submitted visa application documents
        Args:
            application_id: Application ID
            documents: Dictionary of document type -> document_url
        Returns:
            Verification result with compliance status
        """
        try:
            if not self.circuit_breaker.is_available():
                logger.warning(f"Circuit breaker OPEN for document verification {application_id}")
                raise Exception("Visa service unavailable")
            
            if application_id not in self.applications:
                raise ValueError(f"Application {application_id} not found")
            
            # Simulate document verification (OCR, compliance check)
            verification_results = {
                "passport": {
                    "verified": True,
                    "expiry_valid": True,
                    "pages_scanned": 3
                },
                "financial_proof": {
                    "verified": True,
                    "minimum_balance_met": True,
                    "last_6_months_stable": True
                },
                "hotel_booking": {
                    "verified": True,
                    "dates_align_with_visa": True
                },
                "travel_insurance": {
                    "verified": True,
                    "coverage_adequate": True
                }
            }
            
            all_verified = all(doc["verified"] for doc in verification_results.values())
            
            # Update application status
            self.applications[application_id]["status"] = VisaStatus.DOCUMENTS_VERIFIED.value
            self.applications[application_id]["documents_submitted"] = list(documents.keys())
            
            logger.info(f"Documents verified for application {application_id}: {all_verified}")
            self.circuit_breaker.record_success()
            
            return {
                "application_id": application_id,
                "all_documents_verified": all_verified,
                "verification_details": verification_results,
                "compliance_score": 0.98,
                "verified_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.circuit_breaker.record_failure()
            logger.error(f"Document verification failed: {str(e)}")
            raise
    
    def apply_visa(
        self,
        applicant_name: str,
        passport_number: str,
        citizen_country: str,
        destination_country: str,
        visa_type: str,
        travel_start_date: str,
        travel_end_date: str
    ) -> VisaApplication:
        """
        Submit a visa application
        Args:
            applicant_name: Full name of applicant
            passport_number: Passport number
            citizen_country: Passport country
            destination_country: Destination country
            visa_type: Type of visa (TOURIST, BUSINESS, STUDENT, etc.)
            travel_start_date: Planned travel start date
            travel_end_date: Planned travel end date
        Returns:
            VisaApplication with reference number
        """
        try:
            if not self.circuit_breaker.is_available():
                logger.warning(f"Circuit breaker OPEN for visa application {applicant_name}")
                raise Exception("Visa service unavailable")
            
            application_id = f"VISA_{citizen_country}_{int(datetime.now().timestamp())}"
            reference_number = f"REF{hashlib.md5(f'{applicant_name}{datetime.now().isoformat()}'.encode()).hexdigest()[:10].upper()}"
            
            # Calculate processing time
            processing_days = 15 if visa_type == "TOURIST" else 20
            estimated_completion = (datetime.now() + timedelta(days=processing_days)).isoformat()
            
            # Get visa fees
            visa_fee = 100.00 if visa_type == "TOURIST" else 200.00
            processing_fee = 25.00
            
            # Create application
            masked_passport = self._mask_passport(passport_number)
            
            application = VisaApplication(
                application_id=application_id,
                applicant_name=applicant_name,
                applicant_passport=masked_passport,
                citizen_country=citizen_country,
                destination_country=destination_country,
                visa_type=visa_type,
                status=VisaStatus.APPLICATION_INITIATED.value,
                application_date=datetime.now().isoformat(),
                estimated_completion_date=estimated_completion,
                visa_fee=visa_fee,
                processing_fee=processing_fee,
                currency="USD",
                reference_number=reference_number,
                documents_submitted=[],
                created_at=datetime.now().isoformat()
            )
            
            self.applications[application_id] = {
                "applicant": applicant_name,
                "passport": passport_number,
                "destination": destination_country,
                "status": VisaStatus.APPLICATION_INITIATED.value,
                "travel_dates": (travel_start_date, travel_end_date)
            }
            
            logger.info(f"Visa application submitted: {application_id}, reference: {reference_number}")
            self.circuit_breaker.record_success()
            
            return application
            
        except Exception as e:
            self.circuit_breaker.record_failure()
            logger.error(f"Visa application failed: {str(e)}")
            raise
    
    def track_status(
        self,
        application_id: str,
        reference_number: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Track visa application status
        Args:
            application_id: Application ID
            reference_number: Reference number (for verification)
        Returns:
            Current application status
        """
        try:
            if not self.circuit_breaker.is_available():
                logger.warning(f"Circuit breaker OPEN for status tracking {application_id}")
                raise Exception("Visa service unavailable")
            
            if application_id not in self.applications:
                raise ValueError(f"Application {application_id} not found")
            
            app = self.applications[application_id]
            
            # Simulate status progression
            status_progression = [
                VisaStatus.APPLICATION_INITIATED.value,
                VisaStatus.ELIGIBILITY_CHECKED.value,
                VisaStatus.DOCUMENTS_SUBMITTED.value,
                VisaStatus.DOCUMENTS_VERIFIED.value,
                VisaStatus.PAYMENT_PROCESSED.value,
                VisaStatus.UNDER_REVIEW.value,
                VisaStatus.VISA_APPROVED.value
            ]
            
            current_status = app.get("status", VisaStatus.APPLICATION_INITIATED.value)
            status_index = status_progression.index(current_status)
            
            # For demo: simulate progression
            next_index = min(status_index + 1, len(status_progression) - 1)
            app["status"] = status_progression[next_index]
            
            logger.info(f"Application {application_id} status: {app['status']}")
            self.circuit_breaker.record_success()
            
            return {
                "application_id": application_id,
                "current_status": app["status"],
                "applicant": app["applicant"],
                "destination": app["destination"],
                "last_updated": datetime.now().isoformat(),
                "progress_percentage": ((next_index + 1) / len(status_progression)) * 100,
                "estimated_completion": (datetime.now() + timedelta(days=10 - next_index)).isoformat()
            }
            
        except Exception as e:
            self.circuit_breaker.record_failure()
            logger.error(f"Status tracking failed: {str(e)}")
            raise
    
    def _mock_visa_eligibility(
        self,
        citizen_country: str,
        destination_country: str
    ) -> VisaEligibility:
        """Mock visa eligibility check"""
        
        # Simple mock database of visa requirements
        visa_db = {
            ("US", "NG"): {
                "eligible": True,
                "visa_type": "TOURIST_VISA",
                "processing_time": 7,
                "visa_fee": 160.00,
                "requirements": [
                    "Valid passport",
                    "Completed visa application form",
                    "Passport photo",
                    "Proof of travel",
                    "Financial proof",
                    "Yellow fever vaccination"
                ],
                "exemptions": []
            },
            ("NG", "US"): {
                "eligible": True,
                "visa_type": "TOURIST_VISA",
                "processing_time": 14,
                "visa_fee": 140.00,
                "requirements": [
                    "Valid passport",
                    "DS-160 form",
                    "Passport photo",
                    "Proof of ties to Nigeria",
                    "Financial proof",
                    "Interview at embassy"
                ],
                "exemptions": []
            },
            ("DE", "FR"): {
                "eligible": True,
                "visa_type": "SCHENGEN_VISA",
                "processing_time": 3,
                "visa_fee": 80.00,
                "requirements": [],
                "exemptions": ["EU Citizen - Freedom of Movement"]
            }
        }
        
        key = (citizen_country, destination_country)
        visa_info = visa_db.get(key, {
            "eligible": True,
            "visa_type": "TOURIST_VISA",
            "processing_time": 10,
            "visa_fee": 100.00,
            "requirements": ["Valid passport", "Travel proof", "Financial proof"],
            "exemptions": []
        })
        
        return VisaEligibility(
            citizen_country=citizen_country,
            destination_country=destination_country,
            eligible=visa_info["eligible"],
            visa_type=visa_info["visa_type"],
            processing_time_days=visa_info["processing_time"],
            visa_fee=visa_info["visa_fee"],
            currency="USD",
            requirements=visa_info["requirements"],
            exemptions=visa_info["exemptions"]
        )
    
    def _mask_passport(self, passport_number: str) -> str:
        """Mask passport number for PII protection"""
        if len(passport_number) < 6:
            return "***"
        return f"{passport_number[:2]}****{passport_number[-2:]}"
