<?php

namespace App\Controller;

use App\Entity\Supplier;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class SupplierController extends AbstractController
{
    #[Route('/suppliers', name: 'get_suppliers', methods: ['GET'])]
    public function getSuppliers(EntityManagerInterface $em): JsonResponse
    {
        $suppliers = $em->getRepository(Supplier::class)->findBy(['active' => true]);
        $data = array_map(fn(Supplier $s) => $s->toArray(), $suppliers);
        return new JsonResponse($data, Response::HTTP_OK);
    }

    #[Route('/suppliers', name: 'create_supplier', methods: ['POST'])]
    public function createSupplier(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['name'], $data['contact'], $data['email'])) {
            return new JsonResponse(['error' => 'Nom, contact et email requis'], Response::HTTP_BAD_REQUEST);
        }
        
        $supplier = new Supplier();
        $supplier->setName($data['name']);
        $supplier->setContact($data['contact']);
        $supplier->setEmail($data['email']);
        $supplier->setPhone($data['phone'] ?? null);
        $supplier->setAddress($data['address'] ?? null);
        $supplier->setCategories($data['categories'] ?? null);
        $supplier->setActive($data['active'] ?? true);
        
        $em->persist($supplier);
        $em->flush();
        
        return new JsonResponse($supplier->toArray(), Response::HTTP_CREATED);
    }

    #[Route('/suppliers/{id}', name: 'update_supplier', methods: ['PUT'])]
    public function updateSupplier(int $id, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $supplier = $em->getRepository(Supplier::class)->find($id);
        
        if (!$supplier) {
            return new JsonResponse(['error' => 'Fournisseur non trouvé'], Response::HTTP_NOT_FOUND);
        }
        
        $data = json_decode($request->getContent(), true);
        
        foreach (['name', 'contact', 'email', 'phone', 'address', 'categories', 'active'] as $field) {
            if (isset($data[$field])) {
                $setter = 'set' . ucfirst($field);
                $supplier->$setter($data[$field]);
            }
        }
        
        $em->flush();
        return new JsonResponse($supplier->toArray(), Response::HTTP_OK);
    }

    #[Route('/suppliers/{id}', name: 'delete_supplier', methods: ['DELETE'])]
    public function deleteSupplier(int $id, EntityManagerInterface $em): JsonResponse
    {
        $supplier = $em->getRepository(Supplier::class)->find($id);
        
        if (!$supplier) {
            return new JsonResponse(['error' => 'Fournisseur non trouvé'], Response::HTTP_NOT_FOUND);
        }
        
        $supplier->setActive(false);
        $em->flush();
        
        return new JsonResponse(['message' => 'Fournisseur désactivé'], Response::HTTP_OK);
    }
}
