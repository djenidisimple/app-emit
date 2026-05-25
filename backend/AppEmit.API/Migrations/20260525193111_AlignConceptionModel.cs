using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace AppEmit.API.Migrations
{
    /// <inheritdoc />
    public partial class AlignConceptionModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Role",
                table: "Utilisateurs",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ParcoursId",
                table: "SeancesCours",
                type: "integer",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Type",
                table: "Salles",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "EstDisponible",
                table: "Salles",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<string>(
                name: "Nom",
                table: "Salles",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Session",
                table: "Reservations",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "DemandesEchange",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DemandeurId = table.Column<int>(type: "integer", nullable: false),
                    CibleId = table.Column<int>(type: "integer", nullable: false),
                    SeanceDemandeurId = table.Column<int>(type: "integer", nullable: false),
                    SeanceCibleId = table.Column<int>(type: "integer", nullable: false),
                    Statut = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Motif = table.Column<string>(type: "text", nullable: true),
                    DateDemande = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    DateReponse = table.Column<DateTime>(type: "timestamp without time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DemandesEchange", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DemandesEchange_SeancesCours_SeanceCibleId",
                        column: x => x.SeanceCibleId,
                        principalTable: "SeancesCours",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DemandesEchange_SeancesCours_SeanceDemandeurId",
                        column: x => x.SeanceDemandeurId,
                        principalTable: "SeancesCours",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DemandesEchange_Utilisateurs_CibleId",
                        column: x => x.CibleId,
                        principalTable: "Utilisateurs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DemandesEchange_Utilisateurs_DemandeurId",
                        column: x => x.DemandeurId,
                        principalTable: "Utilisateurs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SeancesCours_ParcoursId",
                table: "SeancesCours",
                column: "ParcoursId");

            migrationBuilder.CreateIndex(
                name: "IX_DemandesEchange_CibleId",
                table: "DemandesEchange",
                column: "CibleId");

            migrationBuilder.CreateIndex(
                name: "IX_DemandesEchange_DemandeurId",
                table: "DemandesEchange",
                column: "DemandeurId");

            migrationBuilder.CreateIndex(
                name: "IX_DemandesEchange_SeanceCibleId",
                table: "DemandesEchange",
                column: "SeanceCibleId");

            migrationBuilder.CreateIndex(
                name: "IX_DemandesEchange_SeanceDemandeurId",
                table: "DemandesEchange",
                column: "SeanceDemandeurId");

            migrationBuilder.AddForeignKey(
                name: "FK_SeancesCours_Parcours_ParcoursId",
                table: "SeancesCours",
                column: "ParcoursId",
                principalTable: "Parcours",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SeancesCours_Parcours_ParcoursId",
                table: "SeancesCours");

            migrationBuilder.DropTable(
                name: "DemandesEchange");

            migrationBuilder.DropIndex(
                name: "IX_SeancesCours_ParcoursId",
                table: "SeancesCours");

            migrationBuilder.DropColumn(
                name: "Role",
                table: "Utilisateurs");

            migrationBuilder.DropColumn(
                name: "ParcoursId",
                table: "SeancesCours");

            migrationBuilder.DropColumn(
                name: "EstDisponible",
                table: "Salles");

            migrationBuilder.DropColumn(
                name: "Nom",
                table: "Salles");

            migrationBuilder.DropColumn(
                name: "Session",
                table: "Reservations");

            migrationBuilder.AlterColumn<string>(
                name: "Type",
                table: "Salles",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20,
                oldNullable: true);
        }
    }
}
