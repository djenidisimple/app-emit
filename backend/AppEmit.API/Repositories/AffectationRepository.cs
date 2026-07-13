using AppEmit.API.Data;
using AppEmit.API.Entities;
using AppEmit.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AppEmit.API.Repositories;

public class AffectationRepository : GenericRepository<ProfesseurMatiere>, IAffectationRepository
{
    public AffectationRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<ProfesseurMatiere>> GetAllWithIncludesAsync()
    {
        return await _context.ProfesseursMatieres
            .Include(pm => pm.Professeur)
            .Include(pm => pm.Matiere)
            .Include(pm => pm.Parcours)
            .Include(pm => pm.Niveau)
            .ToListAsync();
    }

    public async Task<ProfesseurMatiere?> GetByIdWithIncludesAsync(int id)
    {
        return await _context.ProfesseursMatieres
            .Include(pm => pm.Professeur)
            .Include(pm => pm.Matiere)
            .Include(pm => pm.Parcours)
            .Include(pm => pm.Niveau)
            .FirstOrDefaultAsync(pm => pm.Id == id);
    }

    public async Task<IEnumerable<ProfesseurMatiere>> GetByProfesseurIdAsync(int professeurId)
    {
        return await _context.ProfesseursMatieres
            .Include(pm => pm.Matiere)
            .Include(pm => pm.Parcours)
            .Include(pm => pm.Niveau)
            .Where(pm => pm.ProfesseurId == professeurId)
            .ToListAsync();
    }

    public async Task<bool> ExistsAsync(int professeurId, int matiereId, int? parcoursId, int? niveauId)
    {
        return await _context.ProfesseursMatieres
            .AnyAsync(pm =>
                pm.ProfesseurId == professeurId &&
                pm.MatiereId == matiereId &&
                pm.ParcoursId == parcoursId &&
                pm.NiveauId == niveauId);
    }
}
