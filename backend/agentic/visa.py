from typing import Any, Dict

from backend.booking.visa_service import VisaService, VisaEligibility
from backend.config import Config


class VisaAgent:
    """Agent facade around VisaService for agentic workflows.

    This keeps the LangGraph/Supervisor layer decoupled from the booking
    HTTP routes while still reusing the enterprise-grade VisaService
    (eligibility, requirements, processing times, fees).
    """

    def __init__(self, config: Any | None = None) -> None:
        self._service = VisaService(config or Config)

    def assess_trip(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Run a lightweight visa eligibility check for the current trip.

        The payload is expected to contain at least the citizen and
        destination countries. We are intentionally conservative: if
        we cannot determine them, we return a non-blocking advisory
        instead of raising.
        """

        citizen = (
            payload.get("citizenCountry")
            or payload.get("citizen_country")
            or payload.get("passportCountry")
        )
        destination = (
            payload.get("destinationCountry")
            or payload.get("destination_country")
            or payload.get("to")
        )

        if not citizen or not destination:
            return {
                "eligible": False,
                "advisory_only": True,
                "reason": "Missing citizen/destination context for visa check",
            }

        try:
            eligibility: VisaEligibility = self._service.visa_eligibility_check(
                citizen_country=citizen,
                destination_country=destination,
                passport_number=payload.get("passportNumber"),
            )

            return {
                "citizen_country": eligibility.citizen_country,
                "destination_country": eligibility.destination_country,
                "eligible": eligibility.eligible,
                "visa_type": eligibility.visa_type,
                "processing_time_days": eligibility.processing_time_days,
                "visa_fee": eligibility.visa_fee,
                "currency": eligibility.currency,
                "requirements": eligibility.requirements,
                "exemptions": eligibility.exemptions,
            }
        except Exception:
            # Defer to a generic advisory in case of upstream failure.
            return {
                "eligible": False,
                "advisory_only": True,
                "reason": "Visa service temporarily unavailable; please retry or contact support.",
            }
