using Microsoft.EntityFrameworkCore.Migrations;

namespace AppEmit.API.Migrations
{
    public partial class CreateDemandeEchange : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DemandeEchanges",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SeanceCoursId = table.Column<int>(type: "int", nullable: false),
                    ProfesseurDemandeurId = table.Column<int>(type: "int", nullable: false),
                    ProfesseurCibleId = table.Column<int>(type: "int", nullable: false),
                    Statut = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DateDemande = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DemandeEchanges", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DemandeEchanges_SeanceCours_SeanceCoursId",
                        column: x => x.SeanceCoursId,
                        principalTable: "SeanceCours",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DemandeEchanges_Utilisateurs_ProfesseurDemandeurId",
                        column: x => x.ProfesseurDemandeurId,
                        principalTable: "Utilisateurs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DemandeEchanges_Utilisateurs_ProfesseurCibleId",
                        column: x => x.ProfesseurCibleId,
                        principalTable: "Utilisateurs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DemandeEchanges_ProfesseurCibleId",
                table: "DemandeEchanges",
                column: "ProfesseurCibleId");

            migrationBuilder.CreateIndex(
                name: "IX_DemandeEchanges_ProfesseurDemandeurId",
                table: "DemandeEchanges",
                column: "ProfesseurDemandeurId");

            migrationBuilder.CreateIndex(
                name: "IX_DemandeEchanges_SeanceCoursId",
                table: "DemandeEchanges",
                column: "SeanceCoursId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "DemandeEchanges");
        }
    }
}