<?php

namespace App\Twig\Components;

use App\Entity\Node;
use App\Service\NodeRepositoryInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\UX\LiveComponent\Attribute\AsLiveComponent;
use Symfony\UX\LiveComponent\Attribute\LiveAction;
use Symfony\UX\LiveComponent\Attribute\LiveArg;
use Symfony\UX\LiveComponent\Attribute\LiveProp;
use Symfony\UX\LiveComponent\DefaultActionTrait;

#[AsLiveComponent]
class NodeSearch extends AbstractController
{
    use DefaultActionTrait;

    #[LiveProp(writable: true)]
    public ?string $query = '';
    #[LiveProp(writable: true)]
    public ?bool $find_id_on = true;
    #[LiveProp(writable: true)]
    public ?bool $find_name_on = true;
    #[LiveProp(writable: true)]
    public ?bool $find_ignorecase = true;
    private ?array $data_xml = array();
    private ?string $order = "ASC"; // "DESC"
    private function object2array($object) { return @json_decode(@json_encode($object),true); }

    #[LiveAction]
    public function addNewNode(#[LiveArg('id')] string $id, #[LiveArg('name')] string $name, #[LiveArg('pid')] string $pid, #[LiveArg('status')] string $status): void{
        $node = new Node($id, $name, $pid, $status);
        $this->entityManager->add($node);
    }
    #[LiveAction]
    public function updateNode(#[LiveArg('id')] string $id, #[LiveArg('name')] string $name, #[LiveArg('pid')] string $pid, #[LiveArg('status')] string $status): void{
        $node = new Node($id, $name, $pid, $status);
        $this->entityManager->update($node);
    }
    #[LiveAction]
    public function deleteNode(#[LiveArg('arrid')] array $arrid): void{
        $this->entityManager->removeByIdArray($arrid);
    }
    #[LiveAction]
    public function importXML(Request $request): void // Загрузка из XML
    {
        $data_xml = file_get_contents($request->files->get('xml_file'));
        $data_xml = str_replace(array("\n", "\r", "\t"), '', $data_xml);
        $data_xml = trim(str_replace('"', "'", $data_xml));
        foreach($this->object2array((simplexml_load_string($data_xml)))['row'] as $node){
            $this->data_xml[$node['id']]= array('name' => $node['name'], 'pid' => $node['pid'], 'status' => $node['status']);
        }
        $flatTree = array();
        foreach($this->entityManager->findAll($this->order) as $child => $parent) {
            $this->entityManager->remove($parent);
        }

        $node_for_import = array();

        foreach($this->data_xml as $id => $row) {
            if (!array_key_exists($id, $flatTree) and !in_array($row['name'], $flatTree)){
                $node_for_import[$id] = array('name' => $row['name'], 'pid' => $row['pid'], 'status' => $row['status']);
                $node = new Node($id, $row['name'], $row['pid'], $row['status']);
                $this->entityManager->add($node);
            }
        }
    }
    public function __construct(private readonly NodeRepositoryInterface $entityManager)
    {
    }
    private function parseflatTree(array $flatTree, $root = 0): ?array
    {
        $return = array();
        foreach($flatTree as $child => $parent) {
            if($parent['pid'] == $root) {
                unset($flatTree[$child]);
                $return[$child] = array(
                    'id' => $child,
                    'name' => $parent['name'],
                    'pid' => $parent['pid'],
                    'status' => $parent['status'],
                    'child' => $this->parseflatTree($flatTree, $child),
                );
            }
        }
        return empty($return) ? null : $return;
    }
    private function createTree(array $flatTree): ?array
    {
        $tree = array();
        foreach($flatTree as $child => $parent){
            if (!array_key_exists($parent['pid'], $flatTree)){
                $tree =array_replace($tree, $this->parseflatTree($flatTree, $parent['pid']));
            }
        }
        return empty($tree) ? null : $tree;
    }
    public function getFullList(): ?array
    {
        $flatTree = array();
        foreach($this->entityManager->findAll($this->order) as $child => $parent) {
            $flatTree[$parent->getId()] = array('name' => $parent->getName(), 'pid' => $parent->getPid(), 'status' => $parent->getStatus());
        }
        return $this->createTree($flatTree);
    }
    public function getFullFlatList(): ?array
    {
        $flatTree = array();
        foreach($this->entityManager->findAll($this->order) as $child => $parent) {
            $flatTree[$parent->getId()] = array('name' => $parent->getName(), 'pid' => $parent->getPid(), 'status' => $parent->getStatus());
            }
        return $flatTree;
    }
    public function getList(): ?array
    {
        $flatTree = array();
        foreach($this->entityManager->findAll($this->order) as $child => $parent) {
            if($this->query){
                $query = $this->query;
                if($this->find_ignorecase){
                    $query = mb_strtolower($query);
                    if ($this->find_name_on and !$this->find_id_on) {
                        if (str_contains(mb_strtolower($parent->getName()), $query)) {
                            $flatTree[$parent->getId()] = array('name' => $parent->getName(), 'pid' => $parent->getPid(), 'status' => $parent->getStatus());
                        }
                    }
                    else if(!$this->find_name_on and $this->find_id_on){
                        if (str_contains(mb_strtolower($parent->getId()), $query)) {
                            $flatTree[$parent->getId()] = array('name' => $parent->getName(), 'pid' => $parent->getPid(), 'status' => $parent->getStatus());
                        }

                    }
                    else if ((str_contains(mb_strtolower($parent->getId()), $query)) or (str_contains(mb_strtolower($parent->getName()), $query))){
                        $flatTree[$parent->getId()] = array('name' => $parent->getName(), 'pid' => $parent->getPid(), 'status' => $parent->getStatus());
                    }
                }
                else{
                    if ($this->find_name_on and !$this->find_id_on) {
                        if (str_contains($parent->getName(), $query)) {
                            $flatTree[$parent->getId()] = array('name' => $parent->getName(), 'pid' => $parent->getPid(), 'status' => $parent->getStatus());
                        }
                    }
                    else if(!$this->find_name_on and $this->find_id_on){
                        if (str_contains($parent->getId(), $query)) {
                            $flatTree[$parent->getId()] = array('name' => $parent->getName(), 'pid' => $parent->getPid(), 'status' => $parent->getStatus());
                        }

                    }
                    else if ((str_contains($parent->getId(), $query)) or (str_contains($parent->getName(), $query))){
                        $flatTree[$parent->getId()] = array('name' => $parent->getName(), 'pid' => $parent->getPid(), 'status' => $parent->getStatus());
                    }
                }
            }
            else{
                $flatTree[$parent->getId()] = array('name' => $parent->getName(), 'pid' => $parent->getPid(), 'status' => $parent->getStatus());
            }
        }
        return $this->createTree($flatTree);
    }
    public function getFlatList(): ?array
    {
        $flatTree = array();
        foreach($this->entityManager->findAll($this->order) as $child => $parent) {
            if($this->query){
                $query = $this->query;
                if($this->find_ignorecase){
                    $query = mb_strtolower($query);
                    if ($this->find_name_on and !$this->find_id_on) {
                        if (str_contains(mb_strtolower($parent->getName()), $query)) {
                            $flatTree[$parent->getId()] = array('name' => $parent->getName(), 'pid' => $parent->getPid(), 'status' => $parent->getStatus());
                        }
                    }
                    else if(!$this->find_name_on and $this->find_id_on){
                        if (str_contains(mb_strtolower($parent->getId()), $query)) {
                            $flatTree[$parent->getId()] = array('name' => $parent->getName(), 'pid' => $parent->getPid(), 'status' => $parent->getStatus());
                        }

                    }
                    else if ((str_contains(mb_strtolower($parent->getId()), $query)) or (str_contains(mb_strtolower($parent->getName()), $query))){
                        $flatTree[$parent->getId()] = array('name' => $parent->getName(), 'pid' => $parent->getPid(), 'status' => $parent->getStatus());
                    }
                }
                else{
                    if ($this->find_name_on and !$this->find_id_on) {
                        if (str_contains($parent->getName(), $query)) {
                            $flatTree[$parent->getId()] = array('name' => $parent->getName(), 'pid' => $parent->getPid(), 'status' => $parent->getStatus());
                        }
                    }
                    else if(!$this->find_name_on and $this->find_id_on){
                        if (str_contains($parent->getId(), $query)) {
                            $flatTree[$parent->getId()] = array('name' => $parent->getName(), 'pid' => $parent->getPid(), 'status' => $parent->getStatus());
                        }

                    }
                    else if ((str_contains($parent->getId(), $query)) or (str_contains($parent->getName(), $query))){
                        $flatTree[$parent->getId()] = array('name' => $parent->getName(), 'pid' => $parent->getPid(), 'status' => $parent->getStatus());
                    }
                }
            }
            else{
                $flatTree[$parent->getId()] = array('name' => $parent->getName(), 'pid' => $parent->getPid(), 'status' => $parent->getStatus());
            }
        }
        return $flatTree;
    }
}