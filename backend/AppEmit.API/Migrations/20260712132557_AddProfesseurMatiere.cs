using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace AppEmit.API.Migrations
{
    /// <inheritdoc />
    public partial class AddProfesseurMatiere : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ProfesseursMatieres",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ProfesseurId = table.Column<int>(type: "integer", nullable: false),
                    MatiereId = table.Column<int>(type: "integer", nullable: false),
                    ParcoursId = table.Column<int>(type: "integer", nullable: true),
                    NiveauId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProfesseursMatieres", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProfesseursMatieres_Matieres_MatiereId",
                        column: x => x.MatiereId,
                        principalTable: "Matieres",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProfesseursMatieres_Niveaux_NiveauId",
                        column: x => x.NiveauId,
                        principalTable: "Niveaux",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ProfesseursMatieres_Parcours_ParcoursId",
                        column: x => x.ParcoursId,
                        principalTable: "Parcours",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ProfesseursMatieres_Utilisateurs_ProfesseurId",
                        column: x => x.ProfesseurId,
                        principalTable: "Utilisateurs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProfesseursMatieres_MatiereId",
                table: "ProfesseursMatieres",
                column: "MatiereId");

            migrationBuilder.CreateIndex(
                name: "IX_ProfesseursMatieres_NiveauId",
                table: "ProfesseursMatieres",
                column: "NiveauId");

            migrationBuilder.CreateIndex(
                name: "IX_ProfesseursMatieres_ParcoursId",
                table: "ProfesseursMatieres",
                column: "ParcoursId");

            migrationBuilder.CreateIndex(
                name: "IX_ProfesseursMatieres_ProfesseurId",
                table: "ProfesseursMatieres",
                column: "ProfesseurId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProfesseursMatieres");
        }
    }
}
