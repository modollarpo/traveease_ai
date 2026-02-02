"""
Calendar Export Service
Generates .ics calendar files for iCal, Google Calendar, Outlook integration.
"""

from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import logging
from enum import Enum
import hashlib
import uuid


logger = logging.getLogger(__name__)


class EventType(Enum):
    """Calendar event types"""
    FLIGHT = "FLIGHT"
    HOTEL_CHECKIN = "HOTEL_CHECKIN"
    HOTEL_CHECKOUT = "HOTEL_CHECKOUT"
    ACTIVITY = "ACTIVITY"
    VISA_APPOINTMENT = "VISA_APPOINTMENT"
    REMINDER = "REMINDER"


class CalendarExportService:
    """Service for generating iCalendar (.ics) files for travel bookings"""
    
    def __init__(self):
        """Initialize calendar export service"""
        self.logger = logger
        self.timezone = "UTC"
    
    def generate_flight_event(
        self,
        flight_number: str,
        departure_airport: str,
        arrival_airport: str,
        departure_time: str,
        arrival_time: str,
        booking_reference: str
    ) -> str:
        """Generate iCalendar event for flight"""
        
        event_id = str(uuid.uuid4())
        created_time = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
        
        # Parse times (assuming ISO 8601)
        dep_dt = datetime.fromisoformat(departure_time.replace('Z', '+00:00'))
        arr_dt = datetime.fromisoformat(arrival_time.replace('Z', '+00:00'))
        
        ics_event = f"""BEGIN:VEVENT
UID:{event_id}@traveease.com
DTSTAMP:{created_time}
DTSTART:{dep_dt.strftime('%Y%m%dT%H%M%S')}
DTEND:{arr_dt.strftime('%Y%m%dT%H%M%S')}
SUMMARY:Flight {flight_number} - {departure_airport} to {arrival_airport}
DESCRIPTION:Booking Reference: {booking_reference}\\nDeparture: {departure_airport}\\nArrival: {arrival_airport}\\nFlight: {flight_number}
LOCATION:{departure_airport} Airport
STATUS:CONFIRMED
TRANSP:OPAQUE
END:VEVENT"""
        
        return ics_event
    
    def generate_hotel_events(
        self,
        hotel_name: str,
        city: str,
        check_in_date: str,
        check_out_date: str,
        booking_reference: str
    ) -> List[str]:
        """Generate iCalendar events for hotel check-in and check-out"""
        
        events = []
        created_time = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
        
        # Parse dates
        check_in = datetime.fromisoformat(check_in_date)
        check_out = datetime.fromisoformat(check_out_date)
        
        # Check-in event (2 PM on check-in date)
        check_in_time = check_in.replace(hour=14, minute=0, second=0)
        check_in_event_id = str(uuid.uuid4())
        
        check_in_event = f"""BEGIN:VEVENT
UID:{check_in_event_id}@traveease.com
DTSTAMP:{created_time}
DTSTART:{check_in_time.strftime('%Y%m%dT%H%M%S')}
DTEND:{(check_in_time + timedelta(hours=1)).strftime('%Y%m%dT%H%M%S')}
SUMMARY:Check-in at {hotel_name}
DESCRIPTION:Booking Reference: {booking_reference}\\nLocation: {city}\\nCheck-in from 2:00 PM
LOCATION:{city}
ALARM:15
STATUS:CONFIRMED
TRANSP:TRANSPARENT
END:VEVENT"""
        
        events.append(check_in_event)
        
        # Check-out event (11 AM on check-out date)
        check_out_time = check_out.replace(hour=11, minute=0, second=0)
        check_out_event_id = str(uuid.uuid4())
        
        check_out_event = f"""BEGIN:VEVENT
UID:{check_out_event_id}@traveease.com
DTSTAMP:{created_time}
DTSTART:{check_out_time.strftime('%Y%m%dT%H%M%S')}
DTEND:{check_out_time.strftime('%Y%m%dT%H%M%S')}
SUMMARY:Check-out from {hotel_name}
DESCRIPTION:Booking Reference: {booking_reference}\\nLocation: {city}\\nMust check out by 11:00 AM
LOCATION:{city}
ALARM:60
STATUS:CONFIRMED
TRANSP:TRANSPARENT
END:VEVENT"""
        
        events.append(check_out_event)
        
        return events
    
    def generate_activity_event(
        self,
        activity_name: str,
        location: str,
        start_time: str,
        end_time: str,
        booking_reference: str
    ) -> str:
        """Generate iCalendar event for activity/tour"""
        
        event_id = str(uuid.uuid4())
        created_time = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
        
        # Parse times
        start_dt = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
        end_dt = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
        
        ics_event = f"""BEGIN:VEVENT
UID:{event_id}@traveease.com
DTSTAMP:{created_time}
DTSTART:{start_dt.strftime('%Y%m%dT%H%M%S')}
DTEND:{end_dt.strftime('%Y%m%dT%H%M%S')}
SUMMARY:{activity_name}
DESCRIPTION:Booking Reference: {booking_reference}\\nLocation: {location}\\nMeeting point details will be sent via email
LOCATION:{location}
STATUS:CONFIRMED
TRANSP:OPAQUE
END:VEVENT"""
        
        return ics_event
    
    def generate_visa_appointment_event(
        self,
        visa_type: str,
        appointment_date: str,
        appointment_time: str,
        location: str,
        reference_number: str
    ) -> str:
        """Generate iCalendar event for visa appointment"""
        
        event_id = str(uuid.uuid4())
        created_time = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
        
        # Parse appointment time
        appt_dt = datetime.fromisoformat(f"{appointment_date}T{appointment_time}")
        
        ics_event = f"""BEGIN:VEVENT
UID:{event_id}@traveease.com
DTSTAMP:{created_time}
DTSTART:{appt_dt.strftime('%Y%m%dT%H%M%S')}
DTEND:{(appt_dt + timedelta(hours=1)).strftime('%Y%m%dT%H%M%S')}
SUMMARY:{visa_type} Visa Appointment
DESCRIPTION:Reference: {reference_number}\\nLocation: {location}\\nPlease arrive 15 minutes early with all required documents
LOCATION:{location}
ALARM:1440
STATUS:CONFIRMED
TRANSP:OPAQUE
END:VEVENT"""
        
        return ics_event
    
    def generate_full_itinerary_calendar(
        self,
        traveler_email: str,
        traveler_name: str,
        booking_id: str,
        events_data: Dict[str, Any]
    ) -> str:
        """
        Generate complete iCalendar file for full itinerary
        Args:
            traveler_email: Traveler's email address
            traveler_name: Traveler's full name
            booking_id: Booking reference ID
            events_data: Dictionary containing all event data
        Returns:
            Complete .ics file content as string
        """
        try:
            # iCalendar header
            ics_file = f"""BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Traveease//Traveease Travel Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Traveease Itinerary - {booking_id}
X-WR-TIMEZONE:UTC
X-WR-CALDESC:Travel itinerary for {traveler_name}
BEGIN:VTIMEZONE
TZID:UTC
BEGIN:STANDARD
TZOFFSETFROM:+0000
TZOFFSETTO:+0000
TZNAME:UTC
DTSTART:19700101T000000
END:STANDARD
END:VTIMEZONE
"""
            
            # Add flight events
            if "flights" in events_data:
                for flight in events_data["flights"]:
                    event = self.generate_flight_event(
                        flight_number=flight.get("number", ""),
                        departure_airport=flight.get("departure_airport", ""),
                        arrival_airport=flight.get("arrival_airport", ""),
                        departure_time=flight.get("departure_time", ""),
                        arrival_time=flight.get("arrival_time", ""),
                        booking_reference=flight.get("reference", "")
                    )
                    ics_file += event + "\n"
            
            # Add hotel events
            if "hotels" in events_data:
                for hotel in events_data["hotels"]:
                    events = self.generate_hotel_events(
                        hotel_name=hotel.get("name", "Hotel"),
                        city=hotel.get("city", ""),
                        check_in_date=hotel.get("check_in_date", ""),
                        check_out_date=hotel.get("check_out_date", ""),
                        booking_reference=hotel.get("reference", "")
                    )
                    for event in events:
                        ics_file += event + "\n"
            
            # Add activity events
            if "activities" in events_data:
                for activity in events_data["activities"]:
                    event = self.generate_activity_event(
                        activity_name=activity.get("name", "Activity"),
                        location=activity.get("location", ""),
                        start_time=activity.get("start_time", ""),
                        end_time=activity.get("end_time", ""),
                        booking_reference=activity.get("reference", "")
                    )
                    ics_file += event + "\n"
            
            # Add visa appointments
            if "visa_appointments" in events_data:
                for visa in events_data["visa_appointments"]:
                    event = self.generate_visa_appointment_event(
                        visa_type=visa.get("type", "Visa"),
                        appointment_date=visa.get("date", ""),
                        appointment_time=visa.get("time", ""),
                        location=visa.get("location", ""),
                        reference_number=visa.get("reference", "")
                    )
                    ics_file += event + "\n"
            
            # Add reminder event (7 days before first departure)
            if "flights" in events_data and events_data["flights"]:
                first_flight = events_data["flights"][0]
                reminder_time = datetime.fromisoformat(
                    first_flight.get("departure_time", "").replace('Z', '+00:00')
                ) - timedelta(days=7)
                
                reminder_event_id = str(uuid.uuid4())
                reminder_event = f"""BEGIN:VEVENT
UID:{reminder_event_id}@traveease.com
DTSTAMP:{datetime.utcnow().strftime('%Y%m%dT%H%M%SZ')}
DTSTART:{reminder_time.strftime('%Y%m%dT%H%M%S')}
SUMMARY:Travel reminder - Check your travel documents
DESCRIPTION:Booking Reference: {booking_id}\\nReminder: Check your passport, visa status, and travel insurance before your trip
ALARM:1440
STATUS:CONFIRMED
TRANSP:TRANSPARENT
END:VEVENT"""
                ics_file += reminder_event + "\n"
            
            # Close calendar
            ics_file += "END:VCALENDAR"
            
            self.logger.info(f"Generated full itinerary calendar for {booking_id}")
            return ics_file
            
        except Exception as e:
            self.logger.error(f"Calendar generation failed: {str(e)}")
            raise
    
    def save_calendar_file(
        self,
        content: str,
        filename: str,
        directory: str = "/tmp"
    ) -> str:
        """
        Save calendar file to disk
        Args:
            content: iCalendar content
            filename: Output filename (without extension)
            directory: Directory to save file
        Returns:
            Full path to saved file
        """
        try:
            filepath = f"{directory}/{filename}.ics"
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            
            self.logger.info(f"Calendar file saved: {filepath}")
            return filepath
            
        except Exception as e:
            self.logger.error(f"Failed to save calendar file: {str(e)}")
            raise
    
    def get_calendar_download_link(
        self,
        calendar_content: str
    ) -> Dict[str, Any]:
        """
        Generate data for calendar download (for embedding in email/web)
        Args:
            calendar_content: iCalendar content
        Returns:
            Dictionary with download info and data URL
        """
        import base64
        
        # Create base64-encoded data URL
        encoded = base64.b64encode(calendar_content.encode('utf-8')).decode('utf-8')
        data_url = f"data:text/calendar;base64,{encoded}"
        
        return {
            "data_url": data_url,
            "filename": f"traveease_itinerary_{datetime.now().strftime('%Y%m%d_%H%M%S')}.ics",
            "size_bytes": len(calendar_content.encode('utf-8')),
            "instructions": {
                "google_calendar": "Download and import .ics file to Google Calendar",
                "outlook": "Download and open with Outlook to import",
                "apple_calendar": "Double-click to import to Apple Calendar"
            }
        }


# Service instance
calendar_service = CalendarExportService()
