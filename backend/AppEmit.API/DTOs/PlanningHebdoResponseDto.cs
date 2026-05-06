using System;
using System.Collections.Generic;

namespace AppEmit.API.DTOs
{
    public class PlanningHebdoResponseDto
    {
        public DateTime Lundi { get; set; }
        public DateTime Samedi { get; set; }
        public List<SeancePlanningDto> Seances { get; set; } = new();
    }
}