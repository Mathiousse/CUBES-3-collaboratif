<?php

namespace App\Controller;

use App\Entity\MenuItem;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
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

    #[Route('/menu-items', name: 'create_menu_item', methods: ['POST'])]
    public function createMenuItem(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['name']) || !isset($data['price'])) {
            return new JsonResponse(['error' => 'Name and price are required'], Response::HTTP_BAD_REQUEST);
        }
        
        $menuItem = new MenuItem();
        $menuItem->setName($data['name']);
        $menuItem->setDescription($data['description'] ?? '');
        $menuItem->setPrice($data['price']);
        if (isset($data['image'])) {
            $menuItem->setImage($data['image']);
        }
        
        $em->persist($menuItem);
        $em->flush();
        
        return new JsonResponse($menuItem->toArray(), Response::HTTP_CREATED);
    }

    #[Route('/menu-items/{id}', name: 'update_menu_item', methods: ['PUT'])]
    public function updateMenuItem(int $id, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $menuItem = $em->getRepository(MenuItem::class)->find($id);
        
        if (!$menuItem) {
            return new JsonResponse(['error' => 'Menu item not found'], Response::HTTP_NOT_FOUND);
        }
        
        $data = json_decode($request->getContent(), true);
        
        if (isset($data['name'])) {
            $menuItem->setName($data['name']);
        }
        if (isset($data['description'])) {
            $menuItem->setDescription($data['description']);
        }
        if (isset($data['price'])) {
            $menuItem->setPrice($data['price']);
        }
        if (isset($data['image'])) {
            $menuItem->setImage($data['image']);
        }
        
        $em->flush();
        
        return new JsonResponse($menuItem->toArray(), Response::HTTP_OK);
    }

    #[Route('/menu-items/{id}', name: 'delete_menu_item', methods: ['DELETE'])]
    public function deleteMenuItem(int $id, EntityManagerInterface $em): JsonResponse
    {
        $menuItem = $em->getRepository(MenuItem::class)->find($id);
        
        if (!$menuItem) {
            return new JsonResponse(['error' => 'Menu item not found'], Response::HTTP_NOT_FOUND);
        }
        
        $em->remove($menuItem);
        $em->flush();
        
        return new JsonResponse(['message' => 'Menu item deleted'], Response::HTTP_OK);
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

