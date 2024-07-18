<?php

namespace App\Repository;

use AllowDynamicProperties;
use App\Entity\Node;
use App\Service\NodeRepositoryInterface;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use PHPUnit\Util\Json;
use Psr\Log\LoggerInterface;

/**
 * @extends ServiceEntityRepository<Node>
 */
#[AllowDynamicProperties] class NodeRepository extends ServiceEntityRepository implements NodeRepositoryInterface
{
    public function __construct(ManagerRegistry $registry, private LoggerInterface $advlistLogger)
    {
        parent::__construct($registry, Node::class);
        $this->logger = $advlistLogger;
    }
    public function add(Node $element): void
    {
        $this->logger->info('Добавление элемента', ['new name' => $element->getName()]);
        $this->getEntityManager()->persist($element);
        $this->getEntityManager()->flush();
    }
    public function update(Node $element): void
    {
        $node = $this->findById($element->getId());
        if (!$node){
            $this->logger->info('Добавление элемента', ['new name' => $element->getName()]);
            $this->add($element);
        }
        else {
            $this->logger->info('Обновление элемента', ['prev name' => $node->getName(), 'new name' => $element->getName()]);
            $node->setName($element->getName());
            $node->setPid  ($element->getPid());
            $node->setStatus($element->getStatus());
            $this->getEntityManager()->persist($node);
            $this->getEntityManager()->flush();
        }
    }
    public function removeByIdArray(array $arr_id): void{
        foreach($arr_id as $id){
            $node = $this->findById($id);
            if ($node){
                $this->logger->info('Удаление элемента', ['name' => $node->getName()]);
                $this->remove($node);
            }
        }
    }
    public function remove(Node $element): void
    {
        $this->logger->info('Удаление элемента', ['name' => $element->getName()]);
        $this->getEntityManager()->remove($element);
        $this->getEntityManager()->flush();
    }
    public function findById(string $id): ?Node
    {
        return $this->find($id);
    }
    public function findByPid(string $pid): ?Node
    {
        return $this->find($pid);
    }
    public function findAll(string $order = 'ASC'): array
    {
        if ($order == '') {
            return $this->findBy(array());
        }
        else{
            return $this->findBy(array(), array('name' => $order));
        }
    }
    public function findByName(string $name): ?Node
    {
        return $this->findOneBy(['name' => $name]);
    }

    //    /**
    //     * @return Node[] Returns an array of Node objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('n')
    //            ->andWhere('n.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('n.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?Node
    //    {
    //        return $this->createQueryBuilder('n')
    //            ->andWhere('n.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
