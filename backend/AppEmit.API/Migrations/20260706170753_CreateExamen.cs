using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace AppEmit.API.Migrations
{
    /// <inheritdoc />
    public partial class CreateExamen : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Examens",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MatiereId = table.Column<int>(type: "integer", nullable: false),
                    ProfesseurId = table.Column<int>(type: "integer", nullable: false),
                    SalleId = table.Column<int>(type: "integer", nullable: false),
                    ParcoursId = table.Column<int>(type: "integer", nullable: true),
                    NiveauId = table.Column<int>(type: "integer", nullable: true),
                    DateExamen = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    HeureDebut = table.Column<TimeSpan>(type: "interval", nullable: false),
                    HeureFin = table.Column<TimeSpan>(type: "interval", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Examens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Examens_Matieres_MatiereId",
                        column: x => x.MatiereId,
                        principalTable: "Matieres",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Examens_Niveaux_NiveauId",
                        column: x => x.NiveauId,
                        principalTable: "Niveaux",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Examens_Parcours_ParcoursId",
                        column: x => x.ParcoursId,
                        principalTable: "Parcours",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Examens_Salles_SalleId",
                        column: x => x.SalleId,
                        principalTable: "Salles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Examens_Utilisateurs_ProfesseurId",
                        column: x => x.ProfesseurId,
                        principalTable: "Utilisateurs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Examens_MatiereId",
                table: "Examens",
                column: "MatiereId");

            migrationBuilder.CreateIndex(
                name: "IX_Examens_NiveauId",
                table: "Examens",
                column: "NiveauId");

            migrationBuilder.CreateIndex(
                name: "IX_Examens_ParcoursId",
                table: "Examens",
                column: "ParcoursId");

            migrationBuilder.CreateIndex(
                name: "IX_Examens_ProfesseurId",
                table: "Examens",
                column: "ProfesseurId");

            migrationBuilder.CreateIndex(
                name: "IX_Examens_SalleId",
                table: "Examens",
                column: "SalleId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Examens");
        }
    }
}
