<?php

namespace App\Controller;

use App\Entity\Franchise;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class FranchiseController extends AbstractController
{
    #[Route('/franchises', name: 'get_franchises', methods: ['GET'])]
    public function getFranchises(EntityManagerInterface $em): JsonResponse
    {
        $franchises = $em->getRepository(Franchise::class)->findBy(['active' => true]);
        $data = array_map(fn(Franchise $f) => $f->toArray(), $franchises);
        return new JsonResponse($data, Response::HTTP_OK);
    }

    #[Route('/franchises', name: 'create_franchise', methods: ['POST'])]
    public function createFranchise(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        $franchise = new Franchise();
        $franchise->setName($data['name']);
        $franchise->setCity($data['city']);
        $franchise->setPostalCode($data['postalCode']);
        $franchise->setAddress($data['address']);
        $franchise->setPhone($data['phone'] ?? null);
        $franchise->setManager($data['manager'] ?? null);
        $franchise->setEmail($data['email'] ?? null);
        $franchise->setOpeningHours($data['openingHours'] ?? null);
        $franchise->setActive($data['active'] ?? true);
        
        $em->persist($franchise);
        $em->flush();
        
        return new JsonResponse($franchise->toArray(), Response::HTTP_CREATED);
    }

    #[Route('/franchises/{id}', name: 'update_franchise', methods: ['PUT'])]
    public function updateFranchise(int $id, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $franchise = $em->getRepository(Franchise::class)->find($id);
        
        if (!$franchise) {
            return new JsonResponse(['error' => 'Franchise non trouvée'], Response::HTTP_NOT_FOUND);
        }
        
        $data = json_decode($request->getContent(), true);
        
        foreach (['name', 'city', 'postalCode', 'address', 'phone', 'manager', 'email', 'openingHours', 'active'] as $field) {
            if (isset($data[$field])) {
                $setter = 'set' . ucfirst($field);
                $franchise->$setter($data[$field]);
            }
        }
        
        $em->flush();
        return new JsonResponse($franchise->toArray(), Response::HTTP_OK);
    }

    #[Route('/franchises/{id}', name: 'delete_franchise', methods: ['DELETE'])]
    public function deleteFranchise(int $id, EntityManagerInterface $em): JsonResponse
    {
        $franchise = $em->getRepository(Franchise::class)->find($id);
        
        if (!$franchise) {
            return new JsonResponse(['error' => 'Franchise non trouvée'], Response::HTTP_NOT_FOUND);
        }
        
        // Soft delete
        $franchise->setActive(false);
        $em->flush();
        
        return new JsonResponse(['message' => 'Franchise désactivée'], Response::HTTP_OK);
    }
}
