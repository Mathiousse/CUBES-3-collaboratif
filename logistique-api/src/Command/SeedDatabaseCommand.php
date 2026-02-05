<?php

namespace App\Command;

use App\Entity\MenuItem;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:seed-database',
    description: 'Seeds the database with sample menu items',
)]
class SeedDatabaseCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $entityManager
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $count = $this->entityManager->getRepository(MenuItem::class)->count([]);
        
        if ($count > 0) {
            $io->warning('Database already contains menu items. Skipping seed.');
            return Command::SUCCESS;
        }

        $menuItems = [
            [
                'name' => 'Classic Burger',
                'description' => 'A delicious beef burger',
                'price' => '12.99'
            ],
            [
                'name' => 'Vegan Burger',
                'description' => 'A plant-based burger',
                'price' => '14.99'
            ],
            [
                'name' => 'Fries',
                'description' => 'Crispy golden fries',
                'price' => '4.50'
            ]
        ];

        foreach ($menuItems as $data) {
            $item = new MenuItem();
            $item->setName($data['name'])
                 ->setDescription($data['description'])
                 ->setPrice($data['price']);
            
            $this->entityManager->persist($item);
        }

        $this->entityManager->flush();

        $io->success('Database seeded with ' . count($menuItems) . ' menu items!');

        return Command::SUCCESS;
    }
}

