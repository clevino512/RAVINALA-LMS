<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\CourseModule;
use App\Models\Lesson;
use App\Models\LessonType;
use App\Models\Status;
use App\Models\User;
use App\Models\UserType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

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
            ['name' => 'Francais', 'description' => 'Cours de langue francaise'],
            ['name' => 'Anglais', 'description' => 'Cours de langue anglaise'],
            ['name' => 'Mathematiques', 'description' => 'Cours de mathematiques'],
            ['name' => 'Informatique', 'description' => 'Cours d informatique'],
        ])->map(fn (array $course) => Course::firstOrCreate(
            ['name' => $course['name']],
            ['description' => $course['description']]
        ));

        $lessonTypes = collect(['PDF', 'Video', 'Audio', 'Quiz', 'Link'])
            ->mapWithKeys(fn (string $name) => [
                $name => LessonType::firstOrCreate(['name' => $name]),
            ]);

        foreach (['not_started', 'in_progress', 'completed'] as $statusName) {
            DB::table('progress_statuses')->updateOrInsert(
                ['name' => $statusName],
                ['created_at' => now(), 'updated_at' => now()]
            );
        }

        $coursesByName = $courses->keyBy('name');

        $courseCatalog = [
            'Francais' => [
                [
                    'title' => 'Bases de grammaire',
                    'description' => 'Introduction aux regles essentielles de la langue francaise.',
                    'lessons' => [
                        ['title' => 'Les classes de mots', 'type' => 'PDF', 'duration' => 18, 'file_path' => 'courses/francais/grammaire/classes-de-mots.pdf', 'is_published' => true],
                        ['title' => 'Accords sujet verbe', 'type' => 'Video', 'duration' => 24, 'file_path' => 'courses/francais/grammaire/accords-sujet-verbe.mp4', 'is_published' => true],
                        ['title' => 'Exercices de conjugaison', 'type' => 'Quiz', 'duration' => 12, 'file_path' => 'courses/francais/grammaire/exercices-conjugaison', 'is_published' => true],
                    ],
                ],
                [
                    'title' => 'Communication orale',
                    'description' => 'Pratique de l expression et de la comprehension orale.',
                    'lessons' => [
                        ['title' => 'Comprendre un dialogue simple', 'type' => 'Audio', 'duration' => 15, 'file_path' => 'courses/francais/oral/dialogue-simple.mp3', 'is_published' => true],
                        ['title' => 'Prendre la parole en public', 'type' => 'Video', 'duration' => 20, 'file_path' => 'courses/francais/oral/parole-en-public.mp4', 'is_published' => false],
                    ],
                ],
            ],
            'Anglais' => [
                [
                    'title' => 'English fundamentals',
                    'description' => 'Vocabulary, pronunciation, and daily expressions.',
                    'lessons' => [
                        ['title' => 'Basic vocabulary', 'type' => 'PDF', 'duration' => 16, 'file_path' => 'courses/anglais/fundamentals/basic-vocabulary.pdf', 'is_published' => true],
                        ['title' => 'Common greetings', 'type' => 'Audio', 'duration' => 10, 'file_path' => 'courses/anglais/fundamentals/common-greetings.mp3', 'is_published' => true],
                        ['title' => 'Listening practice', 'type' => 'Quiz', 'duration' => 14, 'file_path' => 'courses/anglais/fundamentals/listening-practice', 'is_published' => false],
                    ],
                ],
                [
                    'title' => 'Reading and comprehension',
                    'description' => 'Short texts and understanding strategies.',
                    'lessons' => [
                        ['title' => 'Reading short stories', 'type' => 'PDF', 'duration' => 22, 'file_path' => 'courses/anglais/reading/short-stories.pdf', 'is_published' => true],
                        ['title' => 'Answering comprehension questions', 'type' => 'Video', 'duration' => 19, 'file_path' => 'courses/anglais/reading/comprehension-questions.mp4', 'is_published' => true],
                    ],
                ],
            ],
            'Mathematiques' => [
                [
                    'title' => 'Algebre',
                    'description' => 'Expressions, equations et methodes de resolution.',
                    'lessons' => [
                        ['title' => 'Calcul litteral', 'type' => 'PDF', 'duration' => 21, 'file_path' => 'courses/mathematiques/algebre/calcul-litteral.pdf', 'is_published' => true],
                        ['title' => 'Equations du premier degre', 'type' => 'Video', 'duration' => 26, 'file_path' => 'courses/mathematiques/algebre/equations-premier-degre.mp4', 'is_published' => true],
                        ['title' => 'Serie d exercices', 'type' => 'Quiz', 'duration' => 15, 'file_path' => 'courses/mathematiques/algebre/serie-exercices', 'is_published' => true],
                    ],
                ],
                [
                    'title' => 'Geometrie',
                    'description' => 'Figures, proprietes, et raisonnement geometrique.',
                    'lessons' => [
                        ['title' => 'Triangles et quadrilateres', 'type' => 'PDF', 'duration' => 17, 'file_path' => 'courses/mathematiques/geometrie/triangles-quadrilateres.pdf', 'is_published' => true],
                        ['title' => 'Demonstration geometrique', 'type' => 'Video', 'duration' => 23, 'file_path' => 'courses/mathematiques/geometrie/demonstration.mp4', 'is_published' => false],
                    ],
                ],
            ],
            'Informatique' => [
                [
                    'title' => 'Introduction a l informatique',
                    'description' => 'Culture numerique et bases de l environnement informatique.',
                    'lessons' => [
                        ['title' => 'Composants d un ordinateur', 'type' => 'PDF', 'duration' => 14, 'file_path' => 'courses/informatique/intro/composants-ordinateur.pdf', 'is_published' => true],
                        ['title' => 'Systemes d exploitation', 'type' => 'Video', 'duration' => 18, 'file_path' => 'courses/informatique/intro/systemes-exploitation.mp4', 'is_published' => true],
                    ],
                ],
                [
                    'title' => 'Bureautique et internet',
                    'description' => 'Utilisation des outils numeriques de base pour etudier et collaborer.',
                    'lessons' => [
                        ['title' => 'Recherche efficace sur internet', 'type' => 'Link', 'duration' => 9, 'file_path' => 'https://example.com/informatique/recherche-internet', 'is_published' => true],
                        ['title' => 'Traitement de texte', 'type' => 'PDF', 'duration' => 20, 'file_path' => 'courses/informatique/bureautique/traitement-de-texte.pdf', 'is_published' => true],
                        ['title' => 'Presentation orale assistee par ordinateur', 'type' => 'Audio', 'duration' => 11, 'file_path' => 'courses/informatique/bureautique/presentation-ordinateur.mp3', 'is_published' => false],
                    ],
                ],
            ],
        ];

        foreach ($courseCatalog as $courseName => $modules) {
            $course = $coursesByName->get($courseName);

            if (! $course) {
                continue;
            }

            foreach ($modules as $moduleIndex => $moduleData) {
                $module = CourseModule::updateOrCreate(
                    [
                        'course_id' => $course->id,
                        'position' => $moduleIndex + 1,
                    ],
                    [
                        'title' => $moduleData['title'],
                        'description' => $moduleData['description'],
                    ]
                );

                foreach ($moduleData['lessons'] as $lessonIndex => $lessonData) {
                    $lessonType = $lessonTypes->get($lessonData['type']);

                    Lesson::updateOrCreate(
                        [
                            'module_id' => $module->id,
                            'position' => $lessonIndex + 1,
                        ],
                        [
                            'title' => $lessonData['title'],
                            'description' => sprintf('Lecon %s du module %s.', strtolower($lessonData['type']), $moduleData['title']),
                            'file_path' => $lessonData['file_path'],
                            'duration' => $lessonData['duration'],
                            'is_published' => $lessonData['is_published'],
                            'lesson_type_id' => $lessonType?->id,
                        ]
                    );
                }
            }
        }

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
