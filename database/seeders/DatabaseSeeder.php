<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Status;
use App\Models\User;
use App\Models\UserType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $activeStatus = Status::firstOrCreate(
            ['name' => 'actif'],
            ['created_at' => now()->toDateTimeString()]
        );

        Status::firstOrCreate(
            ['name' => 'inactif'],
            ['created_at' => now()->toDateTimeString()]
        );

        $adminType = UserType::firstOrCreate(
            ['name' => 'admin'],
            ['description' => 'Administrateur de la plateforme']
        );

        $studentType = UserType::firstOrCreate(
            ['name' => 'etudiant'],
            ['description' => 'Utilisateur etudiant']
        );

        $teacherType = UserType::firstOrCreate(
            ['name' => 'professeur'],
            ['description' => 'Utilisateur professeur']
        );

        $courses = collect([
            ['name' => 'Français', 'description' => 'Cours de langue française'],
            ['name' => 'Anglais', 'description' => 'Cours de langue anglaise'],
            ['name' => 'Mathématiques', 'description' => 'Cours de mathématiques'],
            ['name' => 'Informatique', 'description' => 'Cours d’informatique'],
        ])->map(fn (array $course) => Course::firstOrCreate(
            ['name' => $course['name']],
            ['description' => $course['description']]
        ));

        $admin = User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'first_name' => 'Administrateur',
                'last_name' => 'Ravinala',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'must_change_password' => false,
                'id_1' => $adminType->id,
                'id_2' => $activeStatus->id,
            ]
        );
        $admin->courses()->sync($courses->pluck('id'));

        $teacherNames = [
            ['Aina', 'Rakoto', 'aina.rakoto@gmail.com'],
            ['Mialy', 'Rasoa', 'mialy.rasoa@yahoo.com'],
            ['Tiana', 'Rabe', 'tiana.rabe@gmail.com'],
            ['Fanja', 'Randria', 'fanja.randria@yahoo.com'],
            ['Hery', 'Ravel', 'hery.ravel@gmail.com'],
            ['Lova', 'Ramanana', 'lova.ramanana@yahoo.com'],
            ['Noro', 'Razafy', 'noro.razafy@gmail.com'],
            ['Tahina', 'Andria', 'tahina.andria@yahoo.com'],
            ['Voahirana', 'Rajaona', 'voahirana.rajaona@gmail.com'],
            ['Mamy', 'Rakotomalala', 'mamy.rakotomalala@yahoo.com'],
        ];

        foreach ($teacherNames as $index => [$firstName, $lastName, $email]) {
            $legacyEmail = sprintf('enseignant%02d@ravinala.test', $index + 1);
            $teacher = User::query()
                ->whereIn('email', [$email, $legacyEmail])
                ->first() ?? new User();

            $teacher->fill([
                'first_name' => $firstName,
                'last_name' => $lastName,
                'email' => $email,
                'sex' => $index % 2 === 0 ? 'homme' : 'femme',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'must_change_password' => true,
                'id_1' => $teacherType->id,
                'id_2' => $activeStatus->id,
            ])->save();

            $teacher->courses()->sync([$courses[$index % $courses->count()]->id]);
        }

        $studentNames = [
            ['Hasina', 'Rakotondrana', 'hasina.rakotondrana@gmail.com'],
            ['Fitia', 'Razafindrakoto', 'fitia.razafindrakoto@yahoo.com'],
            ['Toky', 'Ramanantsoa', 'toky.ramanantsoa@gmail.com'],
            ['Onja', 'Randrianarisoa', 'onja.randrianarisoa@yahoo.com'],
            ['Faneva', 'Rakotoarivelo', 'faneva.rakotoarivelo@gmail.com'],
            ['Mirana', 'Rasolofonirina', 'mirana.rasolofonirina@yahoo.com'],
            ['Tsanta', 'Andriamihaja', 'tsanta.andriamihaja@gmail.com'],
            ['Kanto', 'Ravelomanana', 'kanto.ravelomanana@yahoo.com'],
            ['Njaka', 'Rakotobe', 'njaka.rakotobe@gmail.com'],
            ['Sarobidy', 'Razafimanantsoa', 'sarobidy.razafimanantsoa@yahoo.com'],
            ['Tsiory', 'Andrianjafy', 'tsiory.andrianjafy@gmail.com'],
            ['Aro', 'Rabesahala', 'aro.rabesahala@yahoo.com'],
            ['Fenitra', 'Randriatsara', 'fenitra.randriatsara@gmail.com'],
            ['Lalaina', 'Rakotovao', 'lalaina.rakotovao@yahoo.com'],
            ['Rindra', 'Ramanankasina', 'rindra.ramanankasina@gmail.com'],
            ['Miora', 'Razafindramboa', 'miora.razafindramboa@yahoo.com'],
            ['Santatra', 'Andriantsiferana', 'santatra.andriantsiferana@gmail.com'],
            ['Nomena', 'Rasolofomanana', 'nomena.rasolofomanana@yahoo.com'],
            ['Ialy', 'Rakotonirina', 'ialy.rakotonirina@gmail.com'],
            ['Tovo', 'Randrianasolo', 'tovo.randrianasolo@yahoo.com'],
            ['Soa', 'Raharimalala', 'soa.raharimalala@gmail.com'],
            ['Tantely', 'Rakotomalala', 'tantely.rakotomalala@yahoo.com'],
            ['Mahery', 'Andriambololona', 'mahery.andriambololona@gmail.com'],
            ['Nirina', 'Raveloson', 'nirina.raveloson@yahoo.com'],
            ['Faly', 'Razafindrazaka', 'faly.razafindrazaka@gmail.com'],
            ['Elia', 'Razanajatovo', 'elia.razanajatovo@yahoo.com'],
            ['Rado', 'Ramaroson', 'rado.ramaroson@gmail.com'],
            ['Vola', 'Andrianantenaina', 'vola.andrianantenaina@yahoo.com'],
            ['Haja', 'Rakotondramanana', 'haja.rakotondramanana@gmail.com'],
            ['Malala', 'Razafiarison', 'malala.razafiarison@yahoo.com'],
        ];

        foreach ($studentNames as $index => [$firstName, $lastName, $email]) {
            $legacyEmail = sprintf('etudiant%02d@ravinala.test', $index + 1);
            $student = User::query()
                ->whereIn('email', [$email, $legacyEmail])
                ->first() ?? new User();

            $student->fill([
                'first_name' => $firstName,
                'last_name' => $lastName,
                'email' => $email,
                'sex' => $index % 2 === 0 ? 'homme' : 'femme',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'must_change_password' => true,
                'id_1' => $studentType->id,
                'id_2' => $activeStatus->id,
            ])->save();

            $student->courses()->sync([$courses[$index % $courses->count()]->id]);
        }

    }
}
