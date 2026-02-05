<?php

namespace App\Controller;

use App\Entity\MenuItem;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class MenuController extends AbstractController
{
    #[Route('/menu-items', name: 'get_menu_items', methods: ['GET'])]
    public function getMenuItems(EntityManagerInterface $em): JsonResponse
    {
        $menuItems = $em->getRepository(MenuItem::class)->findAll();
        
        $data = array_map(fn(MenuItem $item) => $item->toArray(), $menuItems);
        
        return new JsonResponse($data, Response::HTTP_OK);
    }

    #[Route('/health', name: 'health_check', methods: ['GET'])]
    public function healthCheck(): JsonResponse
    {
        return new JsonResponse([
            'status' => 'ok',
            'service' => 'Logistics API (Symfony)',
            'database' => 'PostgreSQL'
        ]);
    }
}

