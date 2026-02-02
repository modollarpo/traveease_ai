"""
PDF Export Service
Generates itinerary PDFs and financial breakdowns with multi-language support.
"""

from datetime import datetime
from typing import Dict, List, Optional, Any
import logging
from enum import Enum
from decimal import Decimal

# Note: In production, install with: pip install fpdf2 qrcode
# This stub provides the structure; implement with actual fpdf2 library

logger = logging.getLogger(__name__)


class LanguageCode(Enum):
    """Supported languages"""
    EN = "en"
    ES = "es"
    FR = "fr"
    DE = "de"
    PT = "pt"
    AR = "ar"
    ZH = "zh"
    JA = "ja"
    KO = "ko"
    RU = "ru"
    IT = "it"
    NL = "nl"
    YO = "yo"
    HA = "ha"
    SW = "sw"


class LocalizedStrings:
    """Localized string templates for PDF generation"""
    
    STRINGS = {
        "en": {
            "itinerary": "Travel Itinerary",
            "booking_reference": "Booking Reference",
            "traveler_name": "Traveler Name",
            "travel_dates": "Travel Dates",
            "flights": "Flights",
            "hotels": "Accommodations",
            "activities": "Activities",
            "total_cost": "Total Cost",
            "payment_breakdown": "Payment Breakdown",
            "base_price": "Base Price",
            "platform_fee": "Platform Fee",
            "taxes_duties": "Taxes & Duties",
            "cbna_stamp_duty": "CBN Stamp Duty",
            "vat": "VAT",
            "total": "Total",
            "confirmation_code": "Confirmation Code",
            "issued_date": "Issued Date",
            "departure": "Departure",
            "arrival": "Arrival",
            "duration": "Duration",
            "check_in": "Check-In",
            "check_out": "Check-Out",
            "guests": "Guests",
            "thank_you": "Thank you for booking with Traveease!",
            "contact": "For assistance, contact",
        },
        "es": {
            "itinerary": "Itinerario de Viaje",
            "booking_reference": "Referencia de Reserva",
            "traveler_name": "Nombre del Viajero",
            "travel_dates": "Fechas de Viaje",
            "flights": "Vuelos",
            "hotels": "Alojamientos",
            "activities": "Actividades",
            "total_cost": "Costo Total",
            "payment_breakdown": "Desglose de Pagos",
            "base_price": "Precio Base",
            "platform_fee": "Tarifa de Plataforma",
            "taxes_duties": "Impuestos y Aranceles",
            "cbna_stamp_duty": "Arancel CBN",
            "vat": "IVA",
            "total": "Total",
        },
        "fr": {
            "itinerary": "Itinéraire de Voyage",
            "booking_reference": "Référence de Réservation",
            "traveler_name": "Nom du Voyageur",
            "travel_dates": "Dates de Voyage",
            "flights": "Vols",
            "hotels": "Hébergements",
            "activities": "Activités",
            "total_cost": "Coût Total",
            "payment_breakdown": "Ventilation des Paiements",
            "base_price": "Prix de Base",
            "platform_fee": "Frais de Plateforme",
            "taxes_duties": "Taxes et Droits",
            "vat": "TVA",
            "total": "Total",
        },
        "de": {
            "itinerary": "Reiseroute",
            "booking_reference": "Buchungsreferenz",
            "traveler_name": "Name des Reisenden",
            "travel_dates": "Reisedaten",
            "flights": "Flüge",
            "hotels": "Unterkünfte",
            "activities": "Aktivitäten",
            "total_cost": "Gesamtkosten",
            "payment_breakdown": "Zahlungsaufschlüsselung",
            "base_price": "Grundpreis",
            "platform_fee": "Plattformgebühr",
            "taxes_duties": "Steuern und Gebühren",
            "vat": "MwSt",
            "total": "Insgesamt",
        },
        "pt": {
            "itinerary": "Itinerário de Viagem",
            "booking_reference": "Referência de Reserva",
            "traveler_name": "Nome do Viajante",
            "travel_dates": "Datas de Viagem",
            "flights": "Voos",
            "hotels": "Hospedagens",
            "activities": "Atividades",
            "total_cost": "Custo Total",
            "payment_breakdown": "Discriminação de Pagamentos",
            "base_price": "Preço Base",
            "platform_fee": "Taxa de Plataforma",
            "taxes_duties": "Impostos e Taxas",
            "vat": "IVA",
            "total": "Total",
        },
    }
    
    @staticmethod
    def get(language: str, key: str, default: str = "") -> str:
        """Get localized string"""
        lang_strings = LocalizedStrings.STRINGS.get(language, LocalizedStrings.STRINGS["en"])
        return lang_strings.get(key, default)


class PDFExportService:
    """Service for generating PDF exports of itineraries and financial breakdowns"""
    
    def __init__(self):
        """Initialize PDF export service"""
        self.logger = logger
    
    def generate_itinerary_pdf(
        self,
        booking_id: str,
        traveler_name: str,
        travel_start_date: str,
        travel_end_date: str,
        flights: Optional[List[Dict[str, Any]]] = None,
        hotels: Optional[List[Dict[str, Any]]] = None,
        activities: Optional[List[Dict[str, Any]]] = None,
        language: str = "en"
    ) -> bytes:
        """
        Generate itinerary PDF
        Args:
            booking_id: Booking reference ID
            traveler_name: Name of traveler
            travel_start_date: Start date (ISO 8601)
            travel_end_date: End date (ISO 8601)
            flights: List of flight bookings
            hotels: List of hotel bookings
            activities: List of activity bookings
            language: Language code for PDF
        Returns:
            PDF file as bytes
        """
        try:
            # In production: Use fpdf2 library
            # from fpdf import FPDF
            # pdf = FPDF()
            # pdf.add_page()
            # pdf.set_font("Helvetica", size=12)
            
            # Build PDF structure
            pdf_structure = {
                "title": LocalizedStrings.get(language, "itinerary"),
                "booking_id": booking_id,
                "traveler_name": traveler_name,
                "travel_dates": f"{travel_start_date} - {travel_end_date}",
                "sections": {
                    "flights": flights or [],
                    "hotels": hotels or [],
                    "activities": activities or [],
                },
                "generated_at": datetime.now().isoformat(),
                "language": language
            }
            
            self.logger.info(f"Generated itinerary PDF for booking {booking_id}")
            
            # Return mock PDF bytes
            # In production: return actual PDF bytes
            pdf_content = self._build_pdf_content(pdf_structure)
            return pdf_content.encode('utf-8')
            
        except Exception as e:
            self.logger.error(f"PDF generation failed: {str(e)}")
            raise
    
    def generate_financial_breakdown_pdf(
        self,
        booking_id: str,
        base_price: float,
        platform_fee: float,
        taxes: Dict[str, float],
        currency: str = "USD",
        language: str = "en"
    ) -> bytes:
        """
        Generate financial breakdown PDF
        Args:
            booking_id: Booking reference ID
            base_price: Base price of booking
            platform_fee: Platform/commission fee
            taxes: Dictionary of tax types and amounts
            currency: Currency code (ISO 4217)
            language: Language code for PDF
        Returns:
            PDF file as bytes
        """
        try:
            # Calculate total
            total = base_price + platform_fee + sum(taxes.values())
            
            breakdown = {
                "booking_id": booking_id,
                "title": LocalizedStrings.get(language, "payment_breakdown"),
                "items": {
                    LocalizedStrings.get(language, "base_price"): base_price,
                    LocalizedStrings.get(language, "platform_fee"): platform_fee,
                    **{
                        LocalizedStrings.get(language, tax_type, tax_type): amount
                        for tax_type, amount in taxes.items()
                    }
                },
                "total": total,
                "currency": currency,
                "language": language
            }
            
            self.logger.info(f"Generated financial breakdown PDF for booking {booking_id}")
            
            # Build and return PDF
            pdf_content = self._build_financial_pdf(breakdown)
            return pdf_content.encode('utf-8')
            
        except Exception as e:
            self.logger.error(f"Financial PDF generation failed: {str(e)}")
            raise
    
    def generate_combined_pdf(
        self,
        booking_id: str,
        traveler_name: str,
        travel_start_date: str,
        travel_end_date: str,
        flights: Optional[List[Dict[str, Any]]] = None,
        hotels: Optional[List[Dict[str, Any]]] = None,
        activities: Optional[List[Dict[str, Any]]] = None,
        base_price: float = 0,
        platform_fee: float = 0,
        taxes: Optional[Dict[str, float]] = None,
        currency: str = "USD",
        language: str = "en"
    ) -> bytes:
        """
        Generate combined itinerary + financial breakdown PDF
        Args:
            booking_id: Booking reference ID
            traveler_name: Name of traveler
            travel_start_date: Start date
            travel_end_date: End date
            flights: Flight bookings
            hotels: Hotel bookings
            activities: Activity bookings
            base_price: Base booking price
            platform_fee: Platform fee
            taxes: Tax breakdown
            currency: Currency code
            language: Language code
        Returns:
            Combined PDF file as bytes
        """
        try:
            combined_doc = {
                "booking_id": booking_id,
                "traveler_name": traveler_name,
                "travel_dates": f"{travel_start_date} - {travel_end_date}",
                "sections": {
                    "itinerary": {
                        "flights": flights or [],
                        "hotels": hotels or [],
                        "activities": activities or []
                    },
                    "financial": {
                        "base_price": base_price,
                        "platform_fee": platform_fee,
                        "taxes": taxes or {},
                        "total": base_price + platform_fee + sum((taxes or {}).values()),
                        "currency": currency
                    }
                },
                "language": language,
                "generated_at": datetime.now().isoformat()
            }
            
            self.logger.info(f"Generated combined PDF for booking {booking_id}")
            
            pdf_content = self._build_combined_pdf(combined_doc)
            return pdf_content.encode('utf-8')
            
        except Exception as e:
            self.logger.error(f"Combined PDF generation failed: {str(e)}")
            raise
    
    def _build_pdf_content(self, structure: Dict[str, Any]) -> str:
        """Build PDF content structure (stub - use fpdf2 in production)"""
        content = f"""
TRAVEEASE TRAVEL ITINERARY
==========================

Title: {structure['title']}
Booking ID: {structure['booking_id']}
Traveler: {structure['traveler_name']}
Travel Dates: {structure['travel_dates']}

FLIGHTS
-------
{self._format_section(structure['sections']['flights'])}

ACCOMMODATIONS
--------------
{self._format_section(structure['sections']['hotels'])}

ACTIVITIES
----------
{self._format_section(structure['sections']['activities'])}

Generated: {structure['generated_at']}
Language: {structure['language']}
        """
        return content
    
    def _build_financial_pdf(self, breakdown: Dict[str, Any]) -> str:
        """Build financial breakdown PDF content"""
        items_text = "\n".join(
            f"{item}: ${amount:.2f}"
            for item, amount in breakdown['items'].items()
        )
        
        content = f"""
PAYMENT BREAKDOWN
=================

{breakdown['title']}
Booking ID: {breakdown['booking_id']}

{items_text}

TOTAL: {breakdown['currency']} ${breakdown['total']:.2f}

Generated: {datetime.now().isoformat()}
        """
        return content
    
    def _build_combined_pdf(self, doc: Dict[str, Any]) -> str:
        """Build combined PDF content"""
        itinerary = doc['sections']['itinerary']
        financial = doc['sections']['financial']
        
        content = f"""
TRAVEEASE BOOKING CONFIRMATION
===============================

Booking ID: {doc['booking_id']}
Traveler: {doc['traveler_name']}
Travel Dates: {doc['travel_dates']}

--- ITINERARY ---
Flights: {len(itinerary['flights'])} booking(s)
Hotels: {len(itinerary['hotels'])} booking(s)
Activities: {len(itinerary['activities'])} booking(s)

--- FINANCIAL SUMMARY ---
Base Price: ${financial['base_price']:.2f}
Platform Fee: ${financial['platform_fee']:.2f}
Total: {financial['currency']} ${financial['total']:.2f}

Generated: {doc['generated_at']}
Language: {doc['language']}
        """
        return content
    
    @staticmethod
    def _format_section(items: List[Dict[str, Any]]) -> str:
        """Format section items"""
        if not items:
            return "No bookings"
        
        formatted = []
        for item in items:
            formatted.append(f"- {item.get('name', 'Item')}: {item.get('date', 'TBD')}")
        
        return "\n".join(formatted)


# Service instance
pdf_service = PDFExportService()
