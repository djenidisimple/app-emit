using AppEmit.API.Entities;
using AppEmit.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
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
        private readonly IGenericRepository<Creneau> _creneauRepository;

        public CreneauController(IGenericRepository<Creneau> creneauRepository)
        {
            _creneauRepository = creneauRepository;
        }

        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Creneau>>> GetAll()
        {
            var creneaux = await _creneauRepository.GetAllAsync();
            return Ok(creneaux.OrderBy(c => c.Jour).ThenBy(c => c.HeureDebut));
        }
    }
}
