using AppEmit.API.Data;
using AppEmit.API.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AppEmit.API.Controllers
{
    [ApiController]
    [Route("api/creneaux")]
    public class CreneauController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CreneauController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Creneau>>> GetAll()
        {
            var creneaux = await _context.Creneaux.OrderBy(c => c.Jour).ThenBy(c => c.HeureDebut).ToListAsync();
            return Ok(creneaux);
        }
    }
}
