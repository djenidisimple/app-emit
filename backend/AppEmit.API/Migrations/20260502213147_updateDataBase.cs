using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AppEmit.API.Migrations
{
    /// <inheritdoc />
    public partial class updateDataBase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EvenementReservations_Utilisateurs_DemandeurId",
                table: "EvenementReservations");

            migrationBuilder.DropForeignKey(
                name: "FK_ExceptionsPlanning_Salles_NouvelleSalleId",
                table: "ExceptionsPlanning");

            migrationBuilder.DropForeignKey(
                name: "FK_SeancesCours_Niveaux_NiveauId",
                table: "SeancesCours");

            migrationBuilder.DropForeignKey(
                name: "FK_SeancesCours_Utilisateurs_ProfId",
                table: "SeancesCours");

            migrationBuilder.DropIndex(
                name: "IX_ExceptionsPlanning_NouvelleSalleId",
                table: "ExceptionsPlanning");

            migrationBuilder.DropColumn(
                name: "CouleurAffichage",
                table: "SeancesCours");

            migrationBuilder.DropColumn(
                name: "Nom",
                table: "Salles");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Salles");

            migrationBuilder.RenameColumn(
                name: "ProfId",
                table: "SeancesCours",
                newName: "ProfesseurId");

            migrationBuilder.RenameColumn(
                name: "EstTermine",
                table: "SeancesCours",
                newName: "EstTerminee");

            migrationBuilder.RenameIndex(
                name: "IX_SeancesCours_ProfId",
                table: "SeancesCours",
                newName: "IX_SeancesCours_ProfesseurId");

            migrationBuilder.RenameColumn(
                name: "EstDisponible",
                table: "Salles",
                newName: "EstActive");

            migrationBuilder.AlterColumn<string>(
                name: "Role",
                table: "Utilisateurs",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Prenom",
                table: "Utilisateurs",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Nom",
                table: "Utilisateurs",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Matricule",
                table: "Utilisateurs",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Utilisateurs",
                type: "character varying(150)",
                maxLength: 150,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<string>(
                name: "MotDePasseHash",
                table: "Utilisateurs",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<int>(
                name: "NiveauId",
                table: "SeancesCours",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<string>(
                name: "CodeSalle",
                table: "Salles",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Equipements",
                table: "Salles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Libelle",
                table: "Salles",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "Nom",
                table: "Parcours",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Code",
                table: "Niveaux",
                type: "character varying(10)",
                maxLength: 10,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Code",
                table: "Matieres",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Nom",
                table: "Filieres",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "TypeException",
                table: "ExceptionsPlanning",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Motif",
                table: "ExceptionsPlanning",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Titre",
                table: "EvenementReservations",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddForeignKey(
                name: "FK_EvenementReservations_Utilisateurs_DemandeurId",
                table: "EvenementReservations",
                column: "DemandeurId",
                principalTable: "Utilisateurs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SeancesCours_Niveaux_NiveauId",
                table: "SeancesCours",
                column: "NiveauId",
                principalTable: "Niveaux",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_SeancesCours_Utilisateurs_ProfesseurId",
                table: "SeancesCours",
                column: "ProfesseurId",
                principalTable: "Utilisateurs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EvenementReservations_Utilisateurs_DemandeurId",
                table: "EvenementReservations");

            migrationBuilder.DropForeignKey(
                name: "FK_SeancesCours_Niveaux_NiveauId",
                table: "SeancesCours");

            migrationBuilder.DropForeignKey(
                name: "FK_SeancesCours_Utilisateurs_ProfesseurId",
                table: "SeancesCours");

            migrationBuilder.DropColumn(
                name: "MotDePasseHash",
                table: "Utilisateurs");

            migrationBuilder.DropColumn(
                name: "CodeSalle",
                table: "Salles");

            migrationBuilder.DropColumn(
                name: "Equipements",
                table: "Salles");

            migrationBuilder.DropColumn(
                name: "Libelle",
                table: "Salles");

            migrationBuilder.RenameColumn(
                name: "ProfesseurId",
                table: "SeancesCours",
                newName: "ProfId");

            migrationBuilder.RenameColumn(
                name: "EstTerminee",
                table: "SeancesCours",
                newName: "EstTermine");

            migrationBuilder.RenameIndex(
                name: "IX_SeancesCours_ProfesseurId",
                table: "SeancesCours",
                newName: "IX_SeancesCours_ProfId");

            migrationBuilder.RenameColumn(
                name: "EstActive",
                table: "Salles",
                newName: "EstDisponible");

            migrationBuilder.AlterColumn<string>(
                name: "Role",
                table: "Utilisateurs",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<string>(
                name: "Prenom",
                table: "Utilisateurs",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "Nom",
                table: "Utilisateurs",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "Matricule",
                table: "Utilisateurs",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Utilisateurs",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(150)",
                oldMaxLength: 150);

            migrationBuilder.AlterColumn<int>(
                name: "NiveauId",
                table: "SeancesCours",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CouleurAffichage",
                table: "SeancesCours",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Nom",
                table: "Salles",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "Salles",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "Nom",
                table: "Parcours",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "Code",
                table: "Niveaux",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(10)",
                oldMaxLength: 10);

            migrationBuilder.AlterColumn<string>(
                name: "Code",
                table: "Matieres",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<string>(
                name: "Nom",
                table: "Filieres",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "TypeException",
                table: "ExceptionsPlanning",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "Motif",
                table: "ExceptionsPlanning",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Titre",
                table: "EvenementReservations",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200);

            migrationBuilder.CreateIndex(
                name: "IX_ExceptionsPlanning_NouvelleSalleId",
                table: "ExceptionsPlanning",
                column: "NouvelleSalleId");

            migrationBuilder.AddForeignKey(
                name: "FK_EvenementReservations_Utilisateurs_DemandeurId",
                table: "EvenementReservations",
                column: "DemandeurId",
                principalTable: "Utilisateurs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ExceptionsPlanning_Salles_NouvelleSalleId",
                table: "ExceptionsPlanning",
                column: "NouvelleSalleId",
                principalTable: "Salles",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_SeancesCours_Niveaux_NiveauId",
                table: "SeancesCours",
                column: "NiveauId",
                principalTable: "Niveaux",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SeancesCours_Utilisateurs_ProfId",
                table: "SeancesCours",
                column: "ProfId",
                principalTable: "Utilisateurs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
