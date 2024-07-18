<?php

namespace App\Service;
use App\Entity\Node;

interface NodeRepositoryInterface
{
    public function add(Node $element): void;
    public function update(Node $element): void;
    public function remove(Node $element): void;
    public function removeByIdArray(array $arr_id): void;
    public function findAll(string $order): array;
    public function findById(string $id): ?Node;
    public function findByPid(string $pid): ?Node;
    public function findByName(string $name): ?Node;
}