<?php

namespace App\Controller;

use App\Entity\Promotion;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class PromotionController extends AbstractController
{
    #[Route('/promotions', name: 'get_promotions', methods: ['GET'])]
    public function getPromotions(EntityManagerInterface $em): JsonResponse
    {
        $promotions = $em->getRepository(Promotion::class)->findBy(['active' => true]);
        $data = array_map(fn(Promotion $p) => $p->toArray(), $promotions);
        return new JsonResponse($data, Response::HTTP_OK);
    }

    #[Route('/promotions', name: 'create_promotion', methods: ['POST'])]
    public function createPromotion(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['name'], $data['type'], $data['value'], $data['startDate'], $data['endDate'])) {
            return new JsonResponse(['error' => 'Champs requis manquants'], Response::HTTP_BAD_REQUEST);
        }
        
        $promotion = new Promotion();
        $promotion->setName($data['name']);
        $promotion->setDescription($data['description'] ?? null);
        $promotion->setType($data['type']);
        $promotion->setValue($data['value']);
        $promotion->setCode($data['code'] ?? null);
        $promotion->setStartDate(new \DateTime($data['startDate']));
        $promotion->setEndDate(new \DateTime($data['endDate']));
        $promotion->setFranchiseIds($data['franchiseIds'] ?? null);
        $promotion->setActive($data['active'] ?? true);
        
        $em->persist($promotion);
        $em->flush();
        
        return new JsonResponse($promotion->toArray(), Response::HTTP_CREATED);
    }

    #[Route('/promotions/{id}', name: 'update_promotion', methods: ['PUT'])]
    public function updatePromotion(int $id, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $promotion = $em->getRepository(Promotion::class)->find($id);
        
        if (!$promotion) {
            return new JsonResponse(['error' => 'Promotion non trouvée'], Response::HTTP_NOT_FOUND);
        }
        
        $data = json_decode($request->getContent(), true);
        
        foreach (['name', 'description', 'type', 'value', 'code', 'franchiseIds', 'active'] as $field) {
            if (isset($data[$field])) {
                $setter = 'set' . ucfirst($field);
                $promotion->$setter($data[$field]);
            }
        }
        
        if (isset($data['startDate'])) {
            $promotion->setStartDate(new \DateTime($data['startDate']));
        }
        if (isset($data['endDate'])) {
            $promotion->setEndDate(new \DateTime($data['endDate']));
        }
        
        $em->flush();
        return new JsonResponse($promotion->toArray(), Response::HTTP_OK);
    }

    #[Route('/promotions/{id}', name: 'delete_promotion', methods: ['DELETE'])]
    public function deletePromotion(int $id, EntityManagerInterface $em): JsonResponse
    {
        $promotion = $em->getRepository(Promotion::class)->find($id);
        
        if (!$promotion) {
            return new JsonResponse(['error' => 'Promotion non trouvée'], Response::HTTP_NOT_FOUND);
        }
        
        $promotion->setActive(false);
        $em->flush();
        
        return new JsonResponse(['message' => 'Promotion désactivée'], Response::HTTP_OK);
    }
}
